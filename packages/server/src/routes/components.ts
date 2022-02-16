import * as express from "express";
import { Server } from "socket.io";
import {
  GridLayoutPosition,
  AnimationType,
  Component,
  ComponentV,
} from "@l3s/model";

import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold } from "fp-ts/Either";

const router = express.Router();

let components: Component[] = [
  {
    id: "component-lower-third-big",
    name: "Lower Third Me (Big)",
    config: {
      compatibleWith: ["grid-layout"],
      type: "lower-third",
      gridPosition: GridLayoutPosition.BOTTOM_LEFT,
      data: {
        type: "Big",
        animationTypeIn: AnimationType.fadeIn,
        animationTypeOut: AnimationType.fadeOut,
        line1: "André Markwalder",
        line2: "Head Enterprise Applications",
        logo: "ti&m",
      },
    },
  },
  {
    id: "component-lower-third-small",
    name: "Lower Third Me (Small)",
    config: {
      compatibleWith: ["grid-layout"],
      type: "lower-third",
      gridPosition: GridLayoutPosition.BOTTOM_LEFT,
      data: {
        type: "Small",
        animationTypeIn: AnimationType.rotateIn,
        animationTypeOut: AnimationType.rotateOut,
        line1: "André Markwalder",
        line2: "Head Enterprise Applications",
      },
    },
  },
];

const emitEvent = (ioServer: Server, event: string, payload: object) => {
  const eventPayload = { timestamp: Date.now(), payload };
  console.log(event, eventPayload);
  ioServer.emit(event, eventPayload);
};

export const routes = (ioServer: Server) => {
  ioServer.on("connection", (socket) => {
    console.log("connection", socket.id);

    emitEvent(ioServer, "event://component-update", components);
  });

  router
    .route("/components")
    .get<unknown, Component[], unknown, { cmd: string }>((req, res) => {
      res.json(components);
    });

  router.route("/components").delete<{ cmd: string }>((req, res) => {
    const componentToDelete = components.find(
      (component) => component.name === req.query.cmd
    );

    if (!componentToDelete) {
      res.status(404).json({
        message: `Component '${req.query.cmd}' not found.`,
      });
    } else {
      components = components.filter(
        (component) => component !== componentToDelete
      );

      emitEvent(ioServer, "event://component-update", components);

      res.json({
        message: `Component '${req.query.cmd}' sucessfully deleted.`,
      });
    }
  });

  router.route("/components").post((req, res) => {
    const onLeft = (errors: t.Errors): Component => {
      throw new Error(`Decoding error ${errors}`);
    };

    const onRight = (component: Component) => component;

    const componentToUpsert = pipe(
      ComponentV.decode(req.body),
      fold(onLeft, onRight)
    );

    let added = false;
    const tmpComponents = components.map((component) => {
      if (componentToUpsert.name === component.name) {
        added = true;
        return componentToUpsert;
      }
      return component;
    });
    if (!added) {
      tmpComponents.push(componentToUpsert);
    }
    components = tmpComponents;

    emitEvent(ioServer, "event://component-update", components);

    res.json({
      message: `Component '${componentToUpsert.name}' sucessfully saved.`,
      command: componentToUpsert,
    });
  });

  return router;
};

export default routes;
