import * as express from "express";
import { Server } from "socket.io";

import { Layout, LayoutV } from "@l3s/model";

import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold } from "fp-ts/Either";

const router = express.Router();

let layouts: Layout[] = [
  {
    id: "layout-grid",
    active: false,
    name: "Grid Layout",
    config: {
      type: "grid-layout",
    },
  },
  {
    id: "layout-threejs",
    active: true,
    name: "ThreeJS Layout",
    config: {
      type: "threejs-layout",
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
    if (layouts) {
      emitEvent(ioServer, "event://layout-update", layouts);
    }
  });

  router
    .route("/layouts")
    .get<
      unknown,
      Layout[],
      unknown,
      { id: string; name: string; active: string }
    >((req, res) => {
      const result = layouts.filter((layout) => {
        const { id, name, active } = req.query;
        const idCheck = id === undefined || id === layout.id;
        const nameCheck = name === undefined || name === layout.name;
        const activeCheck =
          active === undefined ||
          active.toLowerCase() === String(layout?.active || false);
        return idCheck && nameCheck && activeCheck;
      });
      res.json(result);
    });

  router.route("/layouts").delete<{ name: string }>((req, res) => {
    const layoutToDelete = layouts.find(
      (layout) => layout.name === req.query.name
    );

    if (!layoutToDelete) {
      res.status(404).json({
        message: `Layout '${req.query.name}' not found.`,
      });
    } else if (layoutToDelete.active) {
      res.status(400).json({
        message: `Layout '${req.query.name}' is active and cannot be deleted.`,
      });
    } else {
      layouts = layouts.filter((layout) => layout !== layoutToDelete);
      res.json({
        message: `Layout '${req.query.name}' sucessfully deleted.`,
      });
    }
  });

  router.route("/layouts").post((req, res) => {
    const onLeft = (errors: t.Errors): Layout => {
      throw new Error(`Decoding error ${errors}`);
    };

    const onRight = (layout: Layout) => layout;

    const layoutToUpsert = pipe(
      LayoutV.decode(req.body),
      fold(onLeft, onRight)
    );

    let added = false;
    layouts = layouts.map((layout) => {
      const newLayout = layout;
      if (layoutToUpsert.active) {
        newLayout.active = undefined;
      }
      if (layoutToUpsert.name === layout.name) {
        added = true;
        return layoutToUpsert;
      }
      return newLayout;
    });
    if (!added) {
      layouts.push(layoutToUpsert);
    }

    if (layoutToUpsert.active) {
      emitEvent(ioServer, "event://layout-update", layoutToUpsert);
    }

    res.json({
      message: `Layout '${layoutToUpsert.name}' sucessfully saved.`,
      layout: layoutToUpsert,
    });
  });

  router.route("/layouts/activate").post<{ name: string }>((req, res) => {
    if (!layouts.find((layout) => layout.name === req.query.name)) {
      res.status(404).json({
        message: `Layout '${req.query.name}' not found.`,
      });
    } else {
      let activeLayout;
      layouts = layouts.map((layout) => {
        const newLayout = layout;
        newLayout.active = layout.name === req.query.name ? true : undefined;
        return newLayout;
      });

      emitEvent(ioServer, "event://layout-update", layouts);

      res.json({
        message: `Layout '${req.query.name}' sucessfully activated.`,
        activeLayout,
      });
    }
  });

  return router;
};

export default routes;
