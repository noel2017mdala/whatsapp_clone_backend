const mongoose = require("mongoose");
const UserSchema = require("../Schema/UserSchema");
const MessagesSchema = require("../Schema/MessageSchema");
const User = mongoose.model("User", UserSchema);
const Messages = mongoose.model("Messages", MessagesSchema);
const { getUserMessages } = require("./MessageModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (userInfo, cb) => {
  let { name, email, password, phoneNumber } = userInfo;
  if (name !== "" && email !== "" && password !== "" && phoneNumber !== "") {
    let checkIfUserExist = await User.find({
      $or: [{ phoneNumber: phoneNumber }, { email: email }],
    });
    let holdContact = [];
    let unregisteredContacts = [];

    if (!checkIfUserExist) {
      // contactList.map(async (contact) => {
      //   let getContact = await User.findOne({ phoneNumber: contact.contact });
      //   if (getContact) {
      //     holdContact.push(getContact._id);
      //   } else {
      //     unregisteredContacts.push(contact.contact);
      //   }
      // });

      let user = new User({
        ...userInfo,
        // contactList: holdContact,
        // unregisteredContacts,
        password: await bcrypt.hash(password, 12),
      });
      user = await user.save();
      if (user) {
        cb(user);
      } else {
        cb(false);
      }
    } else {
      cb(false);
    }
  }
};

const login = async (userData) => {
  let getUser = await User.findOne({ phoneNumber: userData.email }).select(
    "-groups -contactList  -unReadMessages -contactList -unregisteredContacts -groups -media -unreadMessages -UserLastMessage"
  );

  // console.log(getUser);

  if (getUser && (await bcrypt.compare(userData.password, getUser.password))) {
    let secret = process.env.TOKEN_SECRET;

    let { name, email, phoneNumber, _id, profileImage } = getUser;
    let userDetails = {
      name,
      email,
      phoneNumber,
      _id,
      profileImage,
    };

    const token = jwt.sign(
      {
        userId: getUser.id,
      },
      secret,
      {
        expiresIn: "1w",
      }
    );
    return {
      userDetails,
      token,
    };
  } else {
    return false;
  }
};

const addContact = async (id, body, cb) => {
  let checkIfValid = mongoose.Types.ObjectId.isValid(id);
  let user = await User.findById(id);
  if (checkIfValid && user) {
    let contactList = body.contactList;
    let holdContact = [];
    let unregisteredContacts = [];

    let test = Promise.all(
      contactList.map(async (contact) => {
        let getContact = await User.findOne({ phoneNumber: contact.contact });
        if (getContact && getContact._id) {
          return getContact._id;
        } else {
          return contact.contact;
        }
      })
    );

    let numberResult = await test;
    holdContact = [...numberResult];

    let userContactList = user.contactList;
    let updatedList = [...userContactList, ...holdContact];

    let updateContacts = await User.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          contactList: updatedList.map((result) => {
            if (result) {
              return result;
            }
          }),
        },
      },
      {
        new: true,
      }
    );
    if (updateContacts) {
      cb(updateContacts);
    } else {
      cb(false);
    }
  } else {
    cb(false);
  }
};

//gets all users in the users contact list that sent a message
const getUser = async (id, cb) => {
  let userCollection = [];
  let checkIfValid = mongoose.Types.ObjectId.isValid(id);
  if (checkIfValid) {
    let user = await User.findById(id).populate(
      "contactList",
      "-email -password -groups -media -contactList -country -unReadMessages -unregisteredContacts"
    );

    if (user) {
      let test = Promise.all(
        user.contactList.map(async (user) => {
          let getMessages = await getUserMessages(id, user.id, (e) => {
            if (e) {
              return e;
            }
          });

          if (getMessages && mongoose.Types.ObjectId.isValid(getMessages)) {
            let getUser = await User.findById(getMessages)
              .select("-contactList -password -unregisteredContacts")
              .populate("UserLastMessage");

            return getUser;
          }
        })
      );
      let awaitResult = await test;

      let holdLastMessages = [];

      let demo = Promise.all(
        awaitResult.map(async (e) => {
          if (e) {
            const filterMessage = await Messages.find({
              $or: [
                { from: id, to: e._id },
                { from: e._id, to: id },
              ],
            });

            if (filterMessage) {
              let data = filterMessage[filterMessage.length - 1];
              let newObj = {
                userDetails: e,
                userLastMessage: data,
              };

              holdLastMessages.push(newObj);
            }
            return holdLastMessages;
          }
        })
      );

      let data = await demo;

      cb(data[data.length - 1]);
    } else {
      cb(false);
    }
  }
};

const updateUserActivity = async (socketData) => {
  if (mongoose.Types.ObjectId.isValid(socketData.userId)) {
    let id = socketData.userId;

    const updateUserActivity = await User.findByIdAndUpdate(
      id,
      {
        userActivity: {
          userId: id,
          socketId: socketData.socketId,
          lastSeenTime: socketData.lastSeenTime,
        },
      },
      {
        new: true,
      }
    );

    if (updateUserActivity) {
      console.log(
        `User ${id} activity updated successfully ${socketData.socketId}`
      );
    } else {
      console.log("Failed to update user");
    }
  }
};

const removeUserLastSeen = async (socketId) => {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes();

  let getUser = await User.findOne({ "userActivity.socketId": socketId });
  console.log(getUser._id);
  const updateUserActivity = await User.findByIdAndUpdate(
    getUser._id,
    {
      userActivity: {
        userId: getUser._id,
        socketId: null,
        lastSeenTime: time,
      },
    },
    {
      new: true,
    }
  );

  if (updateUserActivity) {
    console.log("Last seen Updated successfully");
  }
};

const getUserActivity = async (userActivityData) => {
  let findUserActivity = await User.findOne({ _id: userActivityData.userId });
  return findUserActivity;
};

module.exports = {
  createUser,
  addContact,
  getUser,
  login,
  updateUserActivity,
  getUserActivity,
  removeUserLastSeen,
};
