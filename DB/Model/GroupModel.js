const mongoose = require("mongoose");
const GroupSchema = require("../Schema/GroupSchema");
const Group = mongoose.model("Group", GroupSchema);

const createGroup = (groupBody) => {
  // let { fd } = groupBody;
  // console.log(fd);
};

module.exports = {
  createGroup,
};
