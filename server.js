import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const httpServer = createServer(app);

const io = new Server(httpServer);

let usernames = [];

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "/index.html"));
});

io.on("connection", (socket) => {
  console.log("A user socket connected: " + socket.id);

  // create username event
  socket.on("new user", (data, cb) => {
    if (usernames.includes(data)) {
      cb(false);
    } else {
      cb(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
      // update username
      // io.emit("usernames", usernames);
    }
  });

  // Create send message event set socket event: 'chat message'. The same event will be cought on client
  socket.on("chat message", (data) => {
    io.emit("chat message", { msg: data, user: socket.username });
  });

  // disconnect socket
  socket.on("disconnect", () => {
    if (!socket.username) {
      return;
    }

    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });

  // update usernames
  function updateUsernames() {
    io.emit("usernames", usernames);
  }
});

httpServer.listen(PORT, () => {
  console.log("Server is listening to http://localhost:8080");
});
