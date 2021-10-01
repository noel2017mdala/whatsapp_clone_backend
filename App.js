const express = require("express");
let cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const {
  updateUserActivity,
  getUserActivity,
  removeUserLastSeen,
} = require("./DB/Model/UserModel");

require("dotenv/config");
const morgan = require("morgan");
const cors = require("cors");

const checkConnection = require("./DB/connection");
const port = process.env.PORT || 8000;

const User = require("./Routes/Users");
const Messages = require("./Routes/Messages");

//Io configurations
io.on("connection", (socket) => {
  console.log("User Connected successfully");

  socket.on("disconnect", async function () {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes();
    console.log(this.id);
    await removeUserLastSeen(this.id);
  });
});

//socket conn
io.use(async (socket, next) => {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes();
  try {
    await updateUserActivity({
      userId: socket.request._query["userId"],
      socketId: socket.id,
      lastSeenTime: time,
    });

    next();
  } catch (error) {
    console.log("Error");
  }
});

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/api/v1/users/login", User);
app.use(morgan("tiny"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(
  "/public/userProfiles",
  express.static(__dirname + "/public/userProfiles")
);
//Routes
app.use(`${process.env.API_URL}/users`, User);
app.use(`${process.env.API_URL}/chat`, Messages);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

checkConnection((conResult) => {
  console.log(conResult);
});
http.listen(port, () => {
  console.log(`Server started on  http://localhost:${port}`);
});
