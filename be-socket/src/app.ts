import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import socketController from "./socket/socketController";

const port = 4000;

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

io.on("connection", (socket: Socket) => {
  console.log(`Client with ID ${socket.id} connected!`);
  socketController(io, socket);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
