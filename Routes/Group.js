const express = require("express");
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const {
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
} = require("../DB/Model/GroupModel");
const Auth = require("../Middleware/Auth-middleware");
const { response } = require("express");
const { resolveSoa } = require("dns");
const GroupRouter = express.Router();

/*
- Sets the destination of the file to be uploaded
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/userProfiles");
  },

  /*
  - Renames the incoming file before being uploaded to the server
  - this helps to easily find the file in the directory 
  */
  filename: (req, file, cb) => {
    let { Uid } = req.body;
    cb(null, `${file.originalname}-${Uid}-${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  //Adding the storage object to Multer
  storage: storage,
  // Declaring the max size of the uploaded image
  limits: {
    fileSize: 4000000,
  },

  // restricting only images to be uploaded
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

GroupRouter.post(
  "/createGroup",
  Auth,
  upload.single("file"),
  async (req, res) => {
    if (req.file) {
      let { Uid, users, description, created_by } = req.body;
      if (Uid && users && description && created_by) {
        let userData = users.split(",");
        userData.push(created_by);

        // Renames the incoming file before being uploaded to the server
        let icon = `public/userProfiles/${
          req.file.originalname
        }-${Uid}-${path.extname(req.file.originalname)}`;

        const uploadSharp = await sharp(icon)
          .resize({ width: 200, height: 200 })
          .png()
          .toFile(`public/userProfiles/${Uid}.png`);

        /*
  Verifying if the image was uploaded before creating the group
  */
        if (fs.existsSync(icon)) {
          let groupInfo = {
            description,
            groupUsers: userData,
            groupImage: icon,
            created_by,
            Uid,
          };

          // Pass the parameters to the createGroup for Group creation
          let newGroup = await createGroup(groupInfo, (results) => {
            if (results.status) {
              res.status(200).send(results);
            } else {
              res.status(400).json({
                message: "Failed to add users to group",
              });
            }
          });
          return;
          if (newGroup) {
            res.status(200).send(newGroup);
          } else {
            res.status(400).json({
              message: "Failed to add users to group",
            });
          }
        } else {
          console.log("The file is not available");
        }
      } else {
        res.status(400).json({ error: "Failed to upload the image" });
      }
    } else {
      res.status(400).json({ error: "please provide an image to be uploaded" });
    }
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

GroupRouter.get("/getGroup/:id", Auth, async (req, res) => {
  if (req.params.id) {
    let groupData = await getGroup(req.params);
    if (groupData) {
      res.status(200).send(groupData);
    } else {
      res.status(400).json({
        message: "Group not found",
      });
    }
  }
});

GroupRouter.get("/commonGroup/:chatUserId/:userId", Auth, async (req, res) => {
  // res.send({
  //   message: "No groups in common found",
  // });

  const { chatUserId, userId } = req.params;

  if (
    mongoose.Types.ObjectId.isValid(chatUserId) &&
    mongoose.Types.ObjectId.isValid(userId)
  ) {
    let commonGroupData = await commonGroups(req.params);
    if (commonGroupData) {
      res.status(200).send(commonGroupData);
    } else {
      res.status(400).json({
        message: [],
      });
    }
  } else {
    res.status(400).json({
      message: [],
    });
  }
});

GroupRouter.post("/makeUsersAdmin", Auth, async (req, res) => {
  let { groupId, userID } = req.body;
  if (groupId && userID) {
    let makeAdmin = await addGroupAdmin({ groupId, userID });
    if (makeAdmin.status) {
      res.status(200).send({
        makeAdmin,
      });
    } else {
      res.status(400).send({
        status: false,
        message: "Failed to make user Admin",
      });
    }
  } else {
    res.status(400).json({
      status: false,
      message: "Failed to make user Admin",
    });
  }
});

GroupRouter.get("/getGroupUsers/:id", Auth, async (req, res) => {
  let id = req.params.id;
  if (id) {
    const groupUsers = await getGroupUsers(id);
    if (groupUsers) {
      res.status(200).send(groupUsers);
    } else {
      res.status(400).json({
        message: "Failed to add user",
      });
    }
    // console.log(groupUsers);
  }
});

GroupRouter.post("/addUsersToGroup", Auth, async (req, res) => {
  let body = req.body;
  const addUsers = await addUsersToGroup(body);
  if (addUsers.status) {
    res.status(200).json({
      message: "User added to group successfully",
      status: true,
    });
  } else {
    res.status(400).json({
      message: "Failed to add user to group",
      status: false,
    });
  }
});

GroupRouter.put(
  "/updateGroupProfile",
  Auth,
  upload.single("file"),
  async (req, res) => {
    if (req.file) {
      let file = req.file;
      const obj = JSON.parse(JSON.stringify(req.body));
      let genId = obj.Uid;
      const uploadSharp = await sharp(file.path)
        .resize({ width: 200, height: 200 })
        .png()
        .toFile(`public/userProfiles/${genId}.png`);

      // console.log(file);
      // console.log(obj);
      // console.log(uploadSharp);
      let updateGroup = await updateGroupWithImage(
        { obj, file, genId },
        (data) => {
          if (data.status) {
            res.status(200).json(data);
          } else {
            res.status(400).json(data);
          }
        }
      );
    } else {
      const obj = JSON.parse(JSON.stringify(req.body));
      let updateGroup = await updateGroupProfile(obj);

      if (updateGroup.status) {
        res.status(200).json({
          message: "Profile updated successfully",
          status: true,
        });
      } else {
        res.status(400).json({
          message: "Failed to add user to group",
          status: false,
        });
      }
    }
  }
);

GroupRouter.get("/userGroups/:id", async (req, res) => {
  const getUserCurrentGroups = await getUserGroups(req.params.id);
  if (getUserCurrentGroups.status) {
    res.send(getUserCurrentGroups.userGroups);
  }
});

GroupRouter.get("/groupLastMessage/:id", async (req, res) => {
  const id = req.params.id;
  if (id) {
    console.log(id);
    let getGroupMessage = await getGroupLastMessage(id);
    if (getGroupMessage) {
      res.status(200).send(getGroupMessage);
    } else {
      res.status(200).json({
        status: false,
        message: "Failed to get group messages",
      });
    }
  }
});
module.exports = GroupRouter;
