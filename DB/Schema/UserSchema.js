const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: `http://localhost:${
      process.env.PORT || 8000
    }/public/userProfiles/defaultProfile.jpg`,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  unReadMessages: [
    {
      type: Object,
    },
  ],
  contactList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  unregisteredContacts: [
    {
      type: Object,
    },
  ],

  groups: [
    {
      type: String,
    },
  ],

  media: [
    {
      type: String,
    },
  ],

  logs: {
    type: String,
  },
  country: {
    type: String,
    default: "Malawi",
  },

  unreadMessages: [
    {
      type: Object,
    },
  ],

  userActivity: [
    {
      type: Object,
    },
  ],

  UserLastMessage: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
    },
  ],

  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

User.virtual("id").get(function () {
  return this._id.toHexString();
});
User.set("toJSON", {
  virtuals: true,
});

module.exports = User;
/*

let fullDate = `${day}/${month}/${year}`;

let messages = {
	[fullDate]: [
      {
        sender: 1,
        message: 'Test Message',
        
      }
    ]
}
*/
