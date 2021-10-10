const mongoose = require("mongoose");
const MessagesSchema = require("../Schema/MessageSchema");
const UserSchema = require("../Schema/UserSchema");
const User = mongoose.model("User", UserSchema);
const Messages = mongoose.model("Messages", MessagesSchema);
const moment = require("moment");
const io = require("../../socket/index");

const createMessage = async (body) => {
  let insertMessage = new Messages({
    ...body,
  });
  insertMessage = await insertMessage.save();
  if (insertMessage) {
    let findReceiveUser = await User.findOne({
      _id: body.from,
      "unreadMessages.sender": body.to,
    }).select("unreadMessages");

    if (findReceiveUser) {
      let messageCounter = findReceiveUser.unreadMessages[0].count;

      let updateUserCounter = await User.updateOne(
        { "unreadMessages.sender": body.to },
        {
          $set: {
            "unreadMessages.$.count": messageCounter + 1,
          },
        }
      );
      if (updateUserCounter) {
        return updateUserCounter;
        console.log("updated unreadMessage successfully");
        // console.log(updateUserCounter);
      }
    } else {
      let findReceiveUser = await User.findOne({
        _id: body.from,
      }).select("unreadMessages");

      // console.log(findReceiveUser);
      // return;
      // let messageCounter = findReceiveUser.unreadMessages[0].count;
      // console.log(findReceiveUser);
      // return;
      let updateUserReadMessages = await User.findByIdAndUpdate(
        findReceiveUser._id,
        {
          $addToSet: {
            unreadMessages: {
              sender: body.to,
              count: 1,
            },
          },
        },
        {
          new: true,
        }
      );

      if (updateUserReadMessages) {
        return updateUserReadMessages;
      }
    }
    // console.log(findReceiveUser);
    return;
  }
};

const setUnread = async ({ userId, senderId }) => {
  let findReceiveUser = await User.findOne({
    _id: userId,
    "unreadMessages.sender": senderId,
  }).select("unreadMessages");

  if (findReceiveUser) {
    let updateUserCounter = await User.updateOne(
      { "unreadMessages.sender": senderId },
      {
        $set: {
          "unreadMessages.$.count": 0,
        },
      }
    );

    if (updateUserCounter) {
      const filterMessage = await Messages.find({
        $or: [
          { from: userId, to: senderId },
          { from: senderId, to: userId },
        ],
      });

      let lastMessage = filterMessage[filterMessage.length - 1];
      // console.log(lastMessage._id);
      let getMessage = await Messages.findByIdAndUpdate(
        lastMessage._id,
        {
          messageStatus: "read",
        },
        {
          new: true,
        }
      );

      if (getMessage) {
        return getMessage;
      }
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
    $or: [
      { from: sender, to: receiver },
      { from: receiver, to: sender },
    ],
  });

  if (filterMessage) {
    let data = filterMessage[filterMessage.length - 1];

    return data;
  }
  return;
};

let getAllUserMessages = async (sender, receiver) => {
  const filterMessage = await Messages.find({
    $or: [
      { from: sender, to: receiver },
      { from: receiver, to: sender },
    ],
  });

  if (filterMessage) {
    let user = await User.findById(receiver).select(
      "-email -password -groups -media -contactList -country -unReadMessages -unregisteredContacts"
    );

    if (user) {
      let userObj = {
        message: filterMessage,
        user,
      };
      return userObj;
    } else {
      return false;
    }
  }
};
module.exports = {
  createMessage,
  getAllMessages,
  getLastMessage,
  getUserMessages,
  getAllUserMessages,
  setUnread,
};
