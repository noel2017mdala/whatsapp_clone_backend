const mongoose = require("mongoose");
const { createUserLastMessage } = require("../../helper/createUserLastMessage");
const MessagesSchema = require("../Schema/MessageSchema");
const UserSchema = require("../Schema/UserSchema");
const User = mongoose.model("User", UserSchema);
const Messages = mongoose.model("Messages", MessagesSchema);
const moment = require("moment");

const createMessage = async (body) => {
  let insertMessage = new Messages({
    ...body,
  });

  insertMessage = await insertMessage.save();
  if (insertMessage) {
    let ids = [body.from, body.to];
    let updateUsersLast = User.updateMany(
      { _id: { $in: ids } },
      { $set: { UserLastMessage: insertMessage._id } },
      { multi: true },
      function (err, records) {
        if (err) {
          return false;
        }
      }
    );

    if (updateUsersLast) {
      return insertMessage;
    }
  }
};

const getAllMessages = async () => {
  let getMessages = await Messages.find();
  if (getMessages) {
    return getMessages;
  }
};

const getUserMessages = async (user1, user2, cb) => {
  const filterMessage = await Messages.find({
    from: user1,
    to: user2,
  });
  if (filterMessage.length > 0) {
    return cb(user2);
  }
};

const getLastMessage = async (sender, receiver) => {
  const filterMessage = await Messages.find({
    from: sender,
    to: receiver,
  });

  if (filterMessage) {
    // let data = filterMessage[filterMessage.length - 1];
    // console.log(filterMessage);

    return filterMessage;
  }
  return;
};
module.exports = {
  createMessage,
  getAllMessages,
  getLastMessage,
  getUserMessages,
};
