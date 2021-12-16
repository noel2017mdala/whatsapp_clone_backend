const mongoose = require("mongoose");
const { Schema } = mongoose;

const Group = new Schema({
  groupName: {
    type: String,
    required: true,
  },
  groupDescription: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    default: "Group",
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
      type: Object,
      required: true,
    },
  ],
  groupAdmin: [
    {
      type: Object,
      required: true,
    },
  ],
  groupLastMessage: {
    type: Object,
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
