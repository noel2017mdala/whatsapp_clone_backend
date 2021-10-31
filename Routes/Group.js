const express = require("express");
const multer = require("multer");
const path = require("path");
const { createGroup } = require("../DB/Model/GroupModel");
const GroupRouter = express.Router();

let time = Date.now();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/userProfiles");
  },

  filename: (req, file, cb) => {
    cb(null, `${file.originalname}-${time}-${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  // dest: "public/userProfiles",
  storage: storage,
  limits: {
    fileSize: 4000000,
  },
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
    // res.send();
    console.log(
      `http://localhost:8000/public/userProfiles/${
        req.file.originalname
      }-${time}-${path.extname(req.file.originalname)}`
    );
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

module.exports = GroupRouter;
