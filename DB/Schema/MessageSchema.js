const mongoose = require("mongoose");
const moment = require("moment");
const { Schema } = mongoose;

let getToday = () => {
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  if (month < 10) {
    return `0${month + 1}/${day}/${year.toString().substr(-2)}`;
  } else {
    return `${month + 1}/${day}/${year.toString().substr(-2)}`;
  }
};

let getTodaysHours = () => {
  let today = new Date();
  let getMinutes =
    today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes();

  let getHours =
    today.getHours() < 10 ? `0${today.getHours()}` : today.getHours();

  let getSeconds =
    today.getSeconds() < 10 ? `0${today.getSeconds()}` : today.getSeconds();

  let time = `${getHours}:${getMinutes}:${getSeconds}`;
  return time;
};
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
  dateSent: {
    type: String,
    default: getToday(),
  },
  timeSent: {
    type: String,
    default: getTodaysHours(),
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
