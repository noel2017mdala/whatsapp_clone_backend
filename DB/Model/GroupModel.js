const mongoose = require("mongoose");
const GroupSchema = require("../Schema/GroupSchema");
const Group = mongoose.model("Group", GroupSchema);
const UserSchema = require("../Schema/UserSchema");
const User = mongoose.model("User", UserSchema);

const createGroup = async (groupBody) => {
  console.log(groupBody);
  let { description, groupUsers, groupImage, created_by } = groupBody;
  if (
    description !== "" &&
    groupUsers !== "" &&
    groupImage !== "" &&
    created_by !== ""
  ) {
    let group = new Group({
      groupName: description,
      groupProfile: `http://localhost:8000/${groupImage}`,
      groupUsers: groupUsers,
      createdBy: created_by,
      groupAdmin: created_by,
    });
    group = await group.save();

    if (group) {
      // let groupId = group._id;
      let addUsersToGroup = Promise.all(
        groupUsers.map(async (e) => {
          let getUser = await User.findByIdAndUpdate(
            e,
            {
              $addToSet: {
                groups: group._id,
              },
            },
            {
              new: true,
            }
          );
          if (getUser) {
            return getUser;
          }
        })
      );
      let userGroup = await addUsersToGroup;
      if (userGroup) {
        return userGroup;
      }
      // let getUser = User.findById()
    } else {
      console.log("failed to create group");
    }
  }
};

module.exports = {
  createGroup,
};
