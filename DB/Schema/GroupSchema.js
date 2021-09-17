const mongoose = require("mongoose");
const { Schema } = mongoose;

const Group = new Schema({
  groupName: {
    type: String,
    required: true,
  },
  groupDescription: {
    type: String,
    required: true,
  },
  groupProfile: {
    type: String,
    default: "",
  },
  groupMedia: [
    {
      type: Object,
    },
  ],
  groupUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: {
    type: String,
    default: "",
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Group;
