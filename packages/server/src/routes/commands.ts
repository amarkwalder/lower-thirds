import * as express from "express";
import { Server } from "socket.io";
import { Command, CommandParams, CommandV, CommandParamsV } from "@l3s/model";

import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold } from "fp-ts/Either";

const router = express.Router();

let commands: Command[] = [
  {
    id: "command-show-component",
    compatibleWith: ["lower-third"],
    name: "showComponent",
    params: { name: "string" },
  },
  {
    id: "command-hide-component",
    compatibleWith: ["lower-third"],
    name: "hideComponent",
    params: { name: "string" },
  },
  {
    id: "command-hide-all-component",
    compatibleWith: ["lower-third"],
    name: "hideAllComponents",
    params: {},
  },
  {
    id: "command-animate-component",
    compatibleWith: ["lower-third"],
    name: "animateComponent",
    params: { name: "string", animation: "string" },
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

    emitEvent(ioServer, "event://command-update", commands);
  });

  router
    .route("/commands")
    .get<unknown, Command[], unknown, { cmd: string }>((req, res) => {
      res.json(commands);
    });

  router.route("/commands").delete<{ cmd: string }>((req, res) => {
    const commandToDelete = commands.find(
      (command) => command.name === req.query.cmd
    );

    if (!commandToDelete) {
      res.status(404).json({
        message: `Command '${req.query.cmd}' not found.`,
      });
    } else {
      commands = commands.filter((command) => command !== commandToDelete);

      emitEvent(ioServer, "event://command-update", commands);

      res.json({
        message: `Command '${req.query.cmd}' sucessfully deleted.`,
      });
    }
  });

  router.route("/commands").post((req, res) => {
    const onLeft = (errors: t.Errors): Command => {
      throw new Error(`Decoding error ${errors}`);
    };

    const onRight = (command: Command) => command;

    const commandToUpsert = pipe(
      CommandV.decode(req.body),
      fold(onLeft, onRight)
    );

    let added = false;
    const tmpCommands = commands.map((command) => {
      if (commandToUpsert.name === command.name) {
        added = true;
        return commandToUpsert;
      }
      return command;
    });
    if (!added) {
      tmpCommands.push(commandToUpsert);
    }
    commands = tmpCommands;

    emitEvent(ioServer, "event://command-update", commands);

    res.json({
      message: `Command '${commandToUpsert.name}' sucessfully saved.`,
      command: commandToUpsert,
    });
  });

  router.route("/commands/exec").post<{ cmd: string }>((req, res) => {
    const commandToExec = commands.find(
      (command) => command.name === req.query.cmd
    );
    if (!commandToExec) {
      res.status(404).json({
        message: `Command '${req.query.cmd}' not found.`,
      });
    } else {
      const onLeft = (errors: t.Errors): CommandParams => {
        throw new Error(`Decoding error ${JSON.stringify(errors, null, "  ")}`);
      };

      const onRight = (commandParams: CommandParams) => commandParams;

      const params = pipe(
        CommandParamsV.decode(req.body),
        fold(onLeft, onRight)
      );

      const commandToEmit = {
        ...commandToExec,
        params: { ...commandToExec.params, ...params },
      };
      emitEvent(ioServer, "event://command-execute", commandToEmit);

      res.json({
        message: `Command '${req.query.cmd}' sucessfully executed.`,
        command: commandToExec,
      });
    }
  });

  return router;
};

export default routes;
