const express = require("express");
const {
  createMessage,
  getAllMessages,
  getLastMessage,
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
module.exports = messagesRouter;
