const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

app.use(express.static("public"));

const keys = ["a","z","e","r","t","y","u","i","o","p"];

let timers = {};        // actieve timers
let counter = 1;        // nummering lopers
let last10 = [];
let top10 = [];

io.on("connection", socket => {
  socket.emit("sync", { timers, last10, top10, counter, serverTime: Date.now() });

  socket.on("start", key => {
    if (!timers[key]) {
      timers[key] = {
        start: Date.now(),
        number: counter++
      };
    }
    io.emit("sync", { timers, last10, top10, counter, serverTime: Date.now() });
  });

  socket.on("stop", key => {
    if (!timers[key]) return;

    const time = Date.now() - timers[key].start;

    const entry = {
      key,
      time,
      number: timers[key].number
    };

    delete timers[key];

    last10.unshift(entry);
    last10 = last10.slice(0, 10);

    top10.push(entry);
    top10.sort((a,b)=>a.time-b.time);
    top10 = top10.slice(0,10);

    io.emit("stopped", entry);
    io.emit("sync", { timers, last10, top10, counter });
  });

  socket.on("reset", () => {
    last10 = [];
    top10 = [];
    counter = 1;
    io.emit("sync", { timers, last10, top10, counter });
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});