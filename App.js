const express = require("express");
const app = express();
const http = require("http");
require("dotenv/config");
const morgan = require("morgan");
const cors = require("cors");
const socketIo = require("./socket/index");
const checkConnection = require("./DB/connection");
const port = process.env.PORT || 8000;
const server = http.createServer();
const io = socketIo(server);

const User = require("./Routes/Users");
const Messages = require("./Routes/Messages");

//Io configurations
io.on("connection", (socket) => {
  socket.on("sendMessage", (msg) => {
    io.emit("ReceiveMsg", msg);
  });
});

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(
  "/public/userProfiles",
  express.static(__dirname + "/public/userProfiles")
);
//Routes
app.use(`${process.env.API_URL}/users`, User);
app.use(`${process.env.API_URL}/chat`, Messages);
// app.get("/", (req, res) => {
//   let imageUrl = `${req.protocol}://${req.get("host")}/public/uploads/`;
//   console.log(imageUrl);
// });

checkConnection((conResult) => {
  console.log(conResult);
});
app.listen(port, () => {
  console.log(`Server started on  http://localhost:${port}`);
});
