const mongoose = require("mongoose");
const moment = require("moment");
const { Schema } = mongoose;

const GroupMessages = new Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messagesBody: {
    type: String,
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  messageStatus: {
    type: String,
    default: "received",
  },
  dateSent: {
    type: String,
    default: moment().format("DD/MM/YYYY"),
  },
  timeSent: {
    type: String,
    required: true,
  },
});

module.exports = GroupMessages;
