const moment = require("moment");

const getTime = () => {
  return moment().format("hh:mm:ss");
};

module.exports = {
  getTime,
};
