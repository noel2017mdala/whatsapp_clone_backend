const mongoose = require("mongoose");
const UserSchema = require("../Schema/UserSchema");
const User = mongoose.model("User", UserSchema);
const { getUserMessages } = require("./MessageModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (userInfo, cb) => {
  let { name, email, password, phoneNumber, contactList } = userInfo;
  if (name !== "" && email !== "" && password !== "" && phoneNumber !== "") {
    let checkIfUserExist = await User.findOne({ phoneNumber: phoneNumber });
    let holdContact = [];
    let unregisteredContacts = [];

    if (!checkIfUserExist) {
      contactList.map(async (contact) => {
        let getContact = await User.findOne({ phoneNumber: contact.contact });
        if (getContact) {
          holdContact.push(getContact._id);
        } else {
          unregisteredContacts.push(contact.contact);
        }
      });

      let user = new User({
        ...userInfo,
        contactList: holdContact,
        unregisteredContacts,
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
  console.log("ndafika");
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
      cb(awaitResult);
    } else {
      cb(false);
    }
  }
};

const greatUser = () => {
  console.log("Hello World");
};

module.exports = {
  createUser,
  addContact,
  getUser,
};
