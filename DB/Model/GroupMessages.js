const mongoose = require("mongoose");
const GroupMessageSchema = require("../Schema/GroupMessagesSchema");
const GroupMessages = mongoose.model("GroupMessage", GroupMessageSchema);
const GroupSchema = require("../Schema/GroupSchema");
const { getTime } = require("../../helper/getTime");
const Group = mongoose.model("Group", GroupSchema);

const getGroupMessages = async (id) => {
  let findGroupMessage = await GroupMessages.find({ groupId: id }).populate({
    path: "from",
    model: "User",
  });
  if (findGroupMessage) {
    return findGroupMessage;
  } else {
    return false;
  }
};

const createGroupMessage = async (body) => {
  let createMessage = await new GroupMessages({
    ...body,
    timeSent: getTime(),
  }).save();

  let updateGroup = await Group.findByIdAndUpdate(
    body.to,
    {
      groupLastMessage: body,
    },
    { new: true }
  );

  if (createMessage && updateGroup) {
    return createMessage;
  } else {
    return false;
  }
};

const groupDetails = async (id) => {
  let group = await Group.findById(id);
  if (group) {
    // console.log(group.groupName);
    return group.groupName;
  }
};

module.exports = {
  getGroupMessages,
  createGroupMessage,
  groupDetails,
};
