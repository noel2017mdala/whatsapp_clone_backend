const express = require("express");
const moment = require("moment");
const {
  getGroupMessages,
  createGroupMessage,
} = require("../DB/Model/GroupMessages");
const Auth = require("../Middleware/Auth-middleware");
const GroupMessages = express.Router();

GroupMessages.get("/getMessages/:id", Auth, async (req, res) => {
  let { id } = req.params;
  let groupMessages = await getGroupMessages(id);
  if (groupMessages) {
    res.status(200).send(groupMessages);
  } else {
    res.status(400).json({
      message: "Failed to retrieve messages",
    });
  }
});

GroupMessages.post("/createGroupMessage", Auth, async (req, res) => {
  let body = req.body;
  let createMessage = await createGroupMessage(body);
  if (createMessage) {
    res.status(200).send(createMessage);
  } else {
    res.status(400).json({
      message: "Failed to create Message",
    });
  }
});

module.exports = GroupMessages;
