const mongoose = require("mongoose");
const GroupMessageSchema = require("../Schema/GroupMessagesSchema");
const GroupMessages = mongoose.model("GroupMessage", GroupMessageSchema);

const getGroupMessages = async (id) => {
  let findGroupMessage = await GroupMessages.find({ groupId: id });
  if (findGroupMessage) {
    return findGroupMessage;
  } else {
    return false;
  }
};

const createGroupMessage = async (body) => {
  let createMessage = await new GroupMessages({
    ...body,
  }).save();
  if (createMessage) {
    return createMessage;
  } else {
    return false;
  }
};
module.exports = {
  getGroupMessages,
  createGroupMessage,
};
