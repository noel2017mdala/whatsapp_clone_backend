const mongoose = require("mongoose");
const GroupSchema = require("../Schema/GroupSchema");
const Group = mongoose.model("Group", GroupSchema);

const createGroup = (groupBody) => {
  console.log(groupBody);
};

module.exports = {
  createGroup,
};
