const express = require("express");
const mongoose = require("mongoose");
let cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const {
  getUserSession,
  updateUserActivity,
  getUserActivity,
  removeUserLastSeen,
  getUserBySocket,
  getUserGroups,
  updateUserNewMessages,
} = require("./DB/Model/UserModel");

const { createMessage } = require("./DB/Model/MessageModel");
const {
  createGroupMessage,
  groupDetails,
} = require("./DB/Model/GroupMessages");

require("dotenv/config");
const morgan = require("morgan");
const cors = require("cors");

const checkConnection = require("./DB/connection");
const port = process.env.PORT || 8000;

const User = require("./Routes/Users");
const Messages = require("./Routes/Messages");
const Group = require("./Routes/Group");
const GroupMessages = require("./Routes/GroupMessages");

//Io configurations
io.on("connection", (socket) => {
  console.log("User Connected successfully");

  socket.on("message-sent", async (message, data) => {
    let userSession = await getUserSession(message.to);
    // console.log(userSession);

    if (userSession) {
      let create = await createMessage({
        ...message,
        messageStatus: "received",
        messageTag: "new",
      });
      if (create) {
        socket.to(userSession).emit("receive-message", message, data);
        socket.emit("demo", message.from, data);
      }
    } else {
      let create = await createMessage({
        ...message,
        messageStatus: "sent",
        messageTag: "new",
      });

      if (create) {
        socket.emit("demo", message.from, data);
        console.log("message sent successfully");
      }
    }
  });

  socket.on("request-demo", (data) => {
    console.log("request received");
    socket.emit("re-fresh-contact", {
      name: "Abel",
    });
  });

  //get group Message
  socket.on("group-message", async (data) => {
    //create group Message
    const createMessage = await createGroupMessage(data);
    if (createMessage) {
      //console.log(createMessage.groupId);
      let getGroup = groupDetails(createMessage.groupId);
      let groupName = await getGroup;
      //Alert user

      io.to(groupName).emit("receive-group-message", { createMessage, data });
      io.emit("receive-group-message-notification", createMessage);
      socket.broadcast
        .to(groupName)
        .emit("receive-group-message", { createMessage, data });
    }
  });

  socket.on("response_emit", (data, id) => {
    // console.log(data);
    // console.log(id);
    // return;
    let body = {
      data,
      id,
    };
    socket.emit("updateList", body);
  });

  socket.on("disconnect", async function () {
    console.log(this.id);
    await removeUserLastSeen(this.id);
  });
});

io.use(async (socket, next) => {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes();
  try {
    await updateUserActivity({
      userId: socket.request._query["userId"],
      socketId: socket.id,
      lastSeenTime: time,
    });

    let messageUpdate = await updateUserNewMessages(
      socket.request._query["userId"]
    );
    if (messageUpdate) {
      const userSession = await getUserSession(messageUpdate[0].from);

      if (userSession) {
        io.to(userSession).emit("user_receive_sent_message", {
          message: "Hello World",
          id: messageUpdate[0].to,
        });
      }
    }
    next();
  } catch (error) {
    // console.log("Error failed to assign token to user");
    return;
  }

  // join users to groups

  if (mongoose.Types.ObjectId.isValid(socket.request._query["userId"])) {
    console.log("rendering");
    let userGroups = await getUserGroups(socket.request._query["userId"]);
    let groupCollection = [];
    if (userGroups) {
      userGroups.map((e) => {
        groupCollection.push(e.groupName);
        return groupCollection;
      });

      let rooms = groupCollection;

      socket.join(rooms);
    }
  } else {
    console.log("Failed to render");
  }
});

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://whatsapp-webb-clone.netlify.app",
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
app.use("/public/audio", express.static(__dirname + "/public/audio"));
//Routes
app.use(`${process.env.API_URL}/users`, User);
app.use(`${process.env.API_URL}/chat`, Messages);
app.use(`${process.env.API_URL}/group`, Group);
app.use(`${process.env.API_URL}/group/chat`, GroupMessages);

// Allow CORS
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

app.get("/", (req, res) => {
  res.send(`Hello World from ${req.headers.origin}`);
});
http.listen(port, () => {
  console.log(`Server started on  http://localhost:${port}`);
});
