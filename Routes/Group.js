const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createGroup, getGroup } = require("../DB/Model/GroupModel");
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
  upload.single("file"),
  async (req, res) => {
    //Parameters provided by the client
    let { Uid, users, description, created_by } = req.body;
    let userData = users.split(",");
    userData.push(created_by);

    // Renames the incoming file before being uploaded to the server
    let icon = `public/userProfiles/${
      req.file.originalname
    }-${Uid}-${path.extname(req.file.originalname)}`;

    /*
Verifying if the image was uploaded before creating the group
*/
    if (fs.existsSync(icon)) {
      let groupInfo = {
        description,
        groupUsers: userData,
        groupImage: icon,
        created_by,
      };

      // Pass the parameters to the createGroup for Group creation
      let newGroup = await createGroup(groupInfo);
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
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

GroupRouter.get("/getGroup/:id", async (req, res) => {
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

module.exports = GroupRouter;
