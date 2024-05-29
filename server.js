import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const httpServer = createServer(app);

const io = new Server(httpServer);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "/index.html"));
});

io.on("connection", (socket) => {
  console.log("A user socket connected: " + socket.id);

  // set socket event: 'chat message'. The same event will be cought on client
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

httpServer.listen(8080, () => {
  console.log("Server is listening to http://localhost:8080");
});
