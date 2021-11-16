const mongoose = require("mongoose");
const moment = require("moment");
const { Schema } = mongoose;

const Messages = new Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messagesBody: {
    type: String,
    required: true,
  },

  messageStatus: {
    type: String,
    default: "sent",
  },

  messageTag: {
    type: String,
  },
  dateSent: {
    type: String,
    default: moment().format("DD/MM/YYYY"),
  },
  timeSent: {
    type: String,
    default: moment().format("hh:mm:ss"),
  },
});

module.exports = Messages;

// const Messages = new Schema({
//   message: [
//     {
//       type: Object,
//       required: true,
//     },
//   ],
//   dateCreated: {
//     type: Date,
//     default: Date.now,
//   },
// });
