const http = require("http");
const socket = require("socket.io");
const fs = require("fs");
const robot = require("robotjs");

//server

let app = http
  .createServer((req, res) => {
    try {
      let content = fs.readFileSync("./static" + req.url, "utf8");
      res.writeHead(200);
      res.write(content);
      res.end();
    } catch {}
  })
  .listen(8080);

io = socket(app);

io.of("/control-panel").on("connection", (socket) => {
  require("dns").lookup(require("os").hostname(), (err, add, fam) => socket.emit("target_local_ip", { ip: add }));
  socket.on("settings", (data) => {
    console.log(data);
    sentivity = data.sentivity / 100;
  });
});

let touchstart = { x: 0, y: 0 };
let mousestart = robot.getMousePos();
let last;
let sentivity = 1;

io.of("/remote").on("connection", (socket) => {
  socket.on("move", (data) => {
    last = "move";
    robot.moveMouse((data.x - touchstart.x) * sentivity + mousestart.x, (data.y - touchstart.y) * sentivity + mousestart.y);
  });
  socket.on("start", (data) => {
    touchstart = data;
    last = "start";
    mousestart = robot.getMousePos();
  });
  socket.on("end", (data) => {
    if (last == "start") robot.mouseClick("left");
  });
  socket.on("click", () => robot.mouseClick());
});

//some valuable information

require("child_process").exec("start http://localhost:8080/control-panel.html");
