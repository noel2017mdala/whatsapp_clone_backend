const express = require("express");
const {
  createMessage,
  getAllMessages,
  getLastMessage,
  getAllUserMessages,
  setUnread,
} = require("../DB/Model/MessageModel");
const messagesRouter = express.Router();
const fullDate = require("../helper/dateHelper");

messagesRouter.post("/createMessage", async (req, res) => {
  let body = req.body;
  let message = await createMessage(body);
  if (message) {
    res.send(message);
  } else {
    res.status(400).json({
      message: "Failed to create Message",
    });
  }
});

messagesRouter.post("/setUserUnread", async (req, res) => {
  let body = req.body;

  let setUnreadChat = await setUnread(body);

  if (setUnreadChat) {
    res.status(200).send(setUnreadChat);
  } else {
    res.status(400).json({
      message: "failed to update chat",
    });
  }
});
messagesRouter.get("/getMessages", async (req, res) => {
  let getMessages = await getAllMessages();
  if (getMessages) {
    res.send(getMessages);
  } else {
    res.status(400).json({
      message: "User not found",
    });
  }
});

messagesRouter.get(
  "/getFilteredMessages/:senderId/:receiverId",
  async (req, res) => {
    let { senderId, receiverId } = req.params;
    let filteredMessages = await getLastMessage(senderId, receiverId);
    if (filteredMessages) {
      res.send(filteredMessages);
    } else {
      res.status(400).json({
        message: "User not found",
      });
    }
  }
);

messagesRouter.get(
  "/getAllMessages/:senderId/:receiverId",
  async (req, res) => {
    let { senderId, receiverId } = req.params;
    let getAllMessages = await getAllUserMessages(senderId, receiverId);

    if (getAllMessages) {
      res.status(200).send(getAllMessages);
    } else {
      res.status(400).json({
        message: "user not found",
      });
    }
  }
);
module.exports = messagesRouter;
