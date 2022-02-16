import express from "express";
import http from "http";
import { Server } from "socket.io";

import cors from "cors";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import * as layoutsRouter from "./routes/layouts";
import * as componentsRouter from "./routes/components";
import * as commandsRouter from "./routes/commands";

const app = express();

const httpServer = http.createServer(app);

// Websocket Server
// -----------------------------------------------------
const wsConfig = {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
};
const ioServer = new Server(httpServer, wsConfig);

ioServer.on("connection", (socket) => {
  console.log("connection", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("disconnect", socket.id, reason);
    socket.removeAllListeners();
  });
});

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Lower Thirds 3D",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "../model/src/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(express.json());

app.use(layoutsRouter.routes(ioServer));
app.use(componentsRouter.routes(ioServer));
app.use(commandsRouter.routes(ioServer));

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  res.status(err.status ?? 500);
  res.json({
    name: err.name,
    message: err.message,
    stack: err.stack,
    err,
  });
  next(err);
};

app.use(errorHandler);

httpServer.listen(4000, () => {
  console.log("listening on *:4000");
});
