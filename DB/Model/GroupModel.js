const mongoose = require("mongoose");
const GroupSchema = require("../Schema/GroupSchema");
const Group = mongoose.model("Group", GroupSchema);
const UserSchema = require("../Schema/UserSchema");
const User = mongoose.model("User", UserSchema);

const createGroup = async (groupBody) => {
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

const getGroup = async ({ id }) => {
  //console.log(id);

  //Validate id

  if (mongoose.Types.ObjectId.isValid(id)) {
    let group = await Group.findById(id).populate({
      path: "groupUsers",
      model: "User",
    });
    if (group) {
      // console.log(group);
      return group;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

module.exports = {
  createGroup,
  getGroup,
};
