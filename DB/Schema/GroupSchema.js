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
