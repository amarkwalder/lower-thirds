import React, { createContext, FC, useEffect } from "react";
import { connect, Socket } from "socket.io-client";
import { useSetRecoilState } from "recoil";
import { Layout, Component, Command } from "@l3s/model";
import {
  layoutsAtom,
  componentsAtom,
  commandsAtom,
  commandsExecAtom,
} from "../store/recoil-store";

import { WS_BASE } from "../config";

type IWebSocketContext = {
  socket?: Socket;
};

export const WebSocketContext = createContext<IWebSocketContext>({});

const ws: IWebSocketContext = {};

export const WebSocketProvider: FC = ({ children }) => {
  const setLayouts = useSetRecoilState(layoutsAtom);
  const setComponents = useSetRecoilState(componentsAtom);
  const setCommands = useSetRecoilState(commandsAtom);
  const setCommandExec = useSetRecoilState(commandsExecAtom);

  useEffect(() => {
    console.log("WebSocketProvider: Initialize websocket");

    const config = {
      transports: ["websocket"],
      upgrade: false,
    };
    ws.socket = connect(WS_BASE, config);

    ws.socket.on("event://layout-update", (msg) => {
      console.log(
        "WebSocketProvider: event://layout-update",
        ws?.socket?.id,
        msg.payload
      );
      setLayouts(msg.payload as Layout[]);
    });

    ws.socket.on("event://component-update", (msg) => {
      console.log(
        "WebSocketProvider: event://component-update",
        ws?.socket?.id,
        msg.payload
      );
      setComponents(msg.payload as Component[]);
    });

    ws.socket.on("event://command-update", (msg) => {
      console.log(
        "WebSocketProvider: event://command-update",
        ws?.socket?.id,
        msg.payload
      );
      setCommands(msg.payload as Command[]);
    });

    ws.socket.on("event://command-execute", (msg) => {
      console.log(
        "WebSocketProvider: event://command-execute",
        ws?.socket?.id,
        msg.payload
      );
      setCommandExec(msg.payload as Command);
    });

    ws.socket.on("connect", () => {
      console.log("WebSocketProvider: Connect", ws?.socket?.id);
    });

    ws.socket.on("disconnect", (reason: string) => {
      console.log("WebSocketProvider: Disconnect", ws?.socket?.id, reason);
    });
  }, [ws]);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
