const mongoose = require("mongoose");
const UserSchema = require("../Schema/UserSchema");
const MessagesSchema = require("../Schema/MessageSchema");
const User = mongoose.model("User", UserSchema);
const Messages = mongoose.model("Messages", MessagesSchema);
const ObjectID = require("mongodb").ObjectID;
const { getUserMessages } = require("./MessageModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (userInfo, cb) => {
  let { name, email, password, phoneNumber } = userInfo;
  if (name !== "" && email !== "" && password !== "" && phoneNumber !== "") {
    let checkIfUserExist = await User.findOne({
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
    "-groups -contactList  -unReadMessages -contactList -unregisteredContacts -groups -media  -UserLastMessage"
  );

  if (getUser) {
    let socketId = getUser.userActivity[0];

    if (socketId) {
      if (socketId.socketId === null) {
        // console.log("user is offline and can log in again");
        if (
          getUser &&
          (await bcrypt.compare(userData.password, getUser.password))
        ) {
          let secret = process.env.TOKEN_SECRET;

          let { name, email, phoneNumber, _id, profileImage, unreadMessages } =
            getUser;
          let userDetails = {
            name,
            email,
            phoneNumber,
            _id,
            profileImage,
            unreadMessages,
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
      } else {
        console.log("user is currently logged please log out first to login");
      }
    } else {
      // console.log("User has never logged in before");
      if (
        getUser &&
        (await bcrypt.compare(userData.password, getUser.password))
      ) {
        let secret = process.env.TOKEN_SECRET;

        let { name, email, phoneNumber, _id, profileImage, unreadMessages } =
          getUser;
        let userDetails = {
          name,
          email,
          phoneNumber,
          _id,
          profileImage,
          unreadMessages,
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
    }
  } else {
    return false;
  }
};

const addContact = async (id, body, cb) => {
  let checkIfValid = mongoose.Types.ObjectId.isValid(id);
  let user = await User.findById(id);

  if (checkIfValid && user) {
    let contactList = body.body;
    let holdContact = [];
    let unregisteredContacts = [];

    let validateContact = await User.findOne({
      phoneNumber: contactList.contact,
    });

    if (validateContact) {
      let contactCollection = [...user.contactList];
      if (!contactCollection.includes(validateContact._id).toString()) {
        contactCollection.push(validateContact._id);

        let updateContacts = await User.findByIdAndUpdate(
          id,
          {
            $addToSet: {
              contactList: contactCollection,
            },
          },
          {
            new: true,
          }
        );

        if (updateContacts) {
          cb(updateContacts);
        }
      } else {
        console.log("you already have this contact");
      }
    } else {
      console.log("contact not found");
    }

    return;
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
  const objectId = new ObjectID();
  let userCollection = [];
  let checkIfValid = mongoose.Types.ObjectId.isValid(id);
  if (checkIfValid) {
    let user = await User.findById(id).populate(
      "contactList",
      "-email -password -groups -media -contactList -country -unReadMessages -unregisteredContacts"
    );

    let getUserMessagesList = await Messages.find({
      $or: [{ from: id }, { to: id }],
    });

    let holdValues = [];
    checkValidityArr = (id) => {
      if (!holdValues.includes(id)) {
        holdValues.push(id);
      }
    };
    getUserMessagesList.map((e) => {
      if (e.to.toString() !== id) {
        checkValidityArr(e.to.toString());
      } else if (e.from.toString() !== id) {
        checkValidityArr(e.from.toString());
      }
    });

    //get User

    let data = Promise.all(
      holdValues.map(async (e) => {
        if (mongoose.Types.ObjectId.isValid(e)) {
          let getUser = await User.findById(ObjectID(e))
            .select("-contactList -password -unregisteredContacts")
            .populate("UserLastMessage");

          const filterMessage = await Messages.find({
            $or: [
              { from: id, to: ObjectID(e) },
              { from: ObjectID(e), to: id },
            ],
          });

          if (getUser && filterMessage) {
            let data = filterMessage[filterMessage.length - 1];
            let newObj = {
              userDetails: getUser,
              userLastMessage: data,
            };
            return newObj;
          }
        }
      })
    );

    let returnedRes = await data;

    if (returnedRes) {
      cb(returnedRes);
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
  // console.log(getUser._id);
  if (getUser) {
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
  }
};

const getUserActivity = async (userActivityData) => {
  let findUserActivity = await User.findOne({ _id: userActivityData.userId });
  return findUserActivity;
};

const getUserSession = async (id) => {
  let getUser = await User.findOne({ _id: id });
  if (getUser && getUser.userActivity) {
    let [{ socketId }] = getUser.userActivity;
    return socketId;
  } else {
    return null;
  }
};

const getUserBySocket = async (socket) => {
  let getUser = await User.findOne({ "userActivity.socketId": socket });
  console.log(getUser.userActivity);
  if (getUser) {
    return {
      socketId: getUser.userActivity,
      id: getUser._id,
    };
  } else {
    return null;
  }
};

const getContactList = async (id) => {
  let fetchContactList = await User.findOne({ _id: id })
    .populate("contactList")
    .select("-unreadMessages -unregisteredContacts");

  if (fetchContactList) {
    return fetchContactList.contactList;
  }
};

module.exports = {
  createUser,
  addContact,
  getUser,
  login,
  updateUserActivity,
  getUserActivity,
  removeUserLastSeen,
  getUserSession,
  getUserBySocket,
  getContactList,
};

/*

    let test = Promise.all(
        holdValues.map(async (user) => {
          let getMessages = await getUserMessages(id, ObjectID(user), (e) => {
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
  
        console.log(data);
  
        cb(data[0]);
      } else {
        cb(false);
      }
*/
