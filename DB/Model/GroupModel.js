const fs = require("fs");
const mongoose = require("mongoose");
const GroupSchema = require("../Schema/GroupSchema");
const Group = mongoose.model("Group", GroupSchema);
const GroupMessageSchema = require("../Schema/GroupMessagesSchema");
const GroupMessages = mongoose.model("GroupMessage", GroupMessageSchema);
const UserSchema = require("../Schema/UserSchema");
const User = mongoose.model("User", UserSchema);
const { uploadObject } = require("./awsS3");

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
      groupProfile: `https://node-whatsapp-backend.herokuapp.com/${groupImage}`,
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

const commonGroups = async (id) => {
  const { chatUserId, userId } = id;

  let getUserIdGroups = await User.findById(userId);
  let getChatUserIdGroup = await User.findById(chatUserId);

  if (
    getChatUserIdGroup.groups.length > 0 &&
    getUserIdGroups.groups.length > 0
  ) {
    let difference = getUserIdGroups.groups.filter((data) => {
      return getChatUserIdGroup.groups.includes(data);
    });

    let groupCollection = Promise.all(
      difference.map(async (groupData) => {
        let group = await Group.findById(groupData).populate({
          path: "groupUsers",
          model: "User",
        });
        if (group) {
          return group;
        }
      })
    );

    let groupData = await groupCollection;
    return groupData;
  } else {
    return [];
    // console.log("No groups found");
  }
};

const getGroupUsers = async (id) => {
  const getGroupUsers = await Group.findById(id);
  if (getGroupUsers) {
    return getGroupUsers.groupUsers;
  } else {
    return {
      status: false,
    };
  }
};

const addGroupAdmin = async (users) => {
  if (users) {
    let makeAdmin = await Group.findByIdAndUpdate(
      users.groupId,
      {
        $push: {
          groupAdmin: users.userID,
        },
      },
      {
        new: true,
      }
    );

    if (makeAdmin) {
      return {
        status: true,
        makeAdmin,
      };
    } else {
      return {
        status: false,
      };
    }
  }
};

const addUsersToGroup = async (usersData) => {
  if (usersData) {
    let { users } = usersData;
    const getGroup = await Group.findById(mongoose.Types.ObjectId(users.id));

    if (
      getGroup.groupUsers.includes(
        users.checkedUsers.map((e) => {
          return e;
        })
      )
    ) {
      return {
        status: false,
        body: "failed to add user to group",
      };
    } else {
    }
    let addUsers = await Group.findByIdAndUpdate(
      mongoose.Types.ObjectId(users.id),
      {
        $push: {
          groupUsers: users.checkedUsers.map((e) => {
            return e;
          }),
        },
      },
      {
        new: true,
      }
    );

    if (addUsers) {
      let addUsers = Promise.all(
        users.checkedUsers.map(async (e) => {
          let getUser = await User.findByIdAndUpdate(
            e,
            {
              $addToSet: {
                groups: users.id,
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

      let addUserResult = await addUsers;
      if (addUserResult) {
        return {
          status: true,
          body: addUserResult,
        };
      } else {
        return {
          status: false,
          body: "failed to add user to group",
        };
      }
    }
  }
};

const updateGroupWithImage = async (body, cb) => {
  let { path } = body.file;
  let { Uid } = body.obj;
  let { group_id, groupName } = body.obj;
<<<<<<< HEAD
  if (path && group_id !== "" && groupName !== "") {
    let updateGroupProfile = await Group.findByIdAndUpdate(
      group_id,
      {
        groupProfile: `${process.env.PRODUCTION_SERVER}${path}`,
        groupName: groupName,
      },
      {
        new: true,
      }
    );

    if (updateGroupProfile) {
      return {
        status: true,
        message: "Profile updated successfully",
      };
    } else {
      return {
        status: false,
        message: "Failed to update profile",
      };
    }
  } else if (path && groupName === "") {
    let updateGroupProfile = await Group.findByIdAndUpdate(
      group_id,
      {
        groupProfile: `${process.env.PRODUCTION_SERVER}${path}`,
      },
      {
        new: true,
      }
    );
=======

  await uploadObject(path, Uid, process.env.BUCKET_NAME, async (data) => {
    if (data.status) {
      fs.unlinkSync(path);
      if (path && group_id !== "" && groupName !== "") {
        let updateGroupProfile = await Group.findByIdAndUpdate(
          group_id,
          {
            groupProfile: Uid,
            groupName: groupName,
          },
          {
            new: true,
          }
        );
>>>>>>> dev_branch

        if (updateGroupProfile) {
          cb({
            status: true,
            message: "Profile updated successfully",
          });
          // return {
          //   status: true,
          //   message: "Profile updated successfully",
          // };
        } else {
          cb({
            status: false,
            message: "Failed to update profile",
          });
          // return {
          //   status: false,
          //   message: "Failed to update profile",
          // };
        }
      } else if (path && groupName === "") {
        let updateGroupProfile = await Group.findByIdAndUpdate(
          group_id,
          {
            groupProfile: Uid,
          },
          {
            new: true,
          }
        );

        if (updateGroupProfile) {
          cb({
            status: true,
            message: "Profile updated successfully",
          });
          // return {
          //   status: true,
          //   message: "Profile updated successfully",
          // };
        } else {
          cb({
            status: false,
            message: "Failed to update profile",
          });
          // return {
          //   status: false,
          //   message: "Failed to update profile",
          // };
        }
      } else {
        cb({
          status: false,
          message: "Failed to update profile",
        });
        // return {
        //   status: false,
        //   message: "Failed to update profile",
        // };
      }
    }
  });
};

const updateGroupProfile = async (body) => {
  if (body) {
    let { group_id, groupName } = body;
    if (groupName !== "") {
      let updateGroup = await Group.findByIdAndUpdate(
        group_id,
        {
          groupName: groupName,
        },
        {
          new: true,
        }
      );

      if (updateGroup) {
        return {
          status: true,
          message: "Profile updated successfully",
        };
      } else {
        return {
          status: false,
          message: "Failed to update profile",
        };
      }
    } else {
      return {
        status: false,
        message: "Failed to update profile",
      };
    }
  } else {
    return {
      status: false,
      message: "Failed to update profile",
    };
  }
};

const getUserGroups = async (id) => {
  // const userGroups = await User.findById(id);
  // console.log(userGroups.groups);
  const userGroups = await Group.find({ groupUsers: { $in: [id] } });
  if (userGroups) {
    return {
      status: true,
      userGroups,
    };
  } else {
    return {
      status: false,
      message: "Failed to retrieve group data",
    };
  }
};

const getGroupLastMessage = async (id) => {
  if (id) {
    let group = await GroupMessages.find({ groupId: id });
    // console.log(group[group.length - 1]);
    if (group.length > 0) {
      return group[group.length - 1];
    }
  }
};
module.exports = {
  createGroup,
  getGroup,
  commonGroups,
  addGroupAdmin,
  getGroupUsers,
  addUsersToGroup,
  updateGroupProfile,
  updateGroupWithImage,
  getGroupLastMessage,
  getUserGroups,
};
