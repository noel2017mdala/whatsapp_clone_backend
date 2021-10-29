const express = require("express");
const { createGroup } = require("../DB/Model/GroupModel");
const GroupRouter = express.Router();

GroupRouter.post("/createGroup", async (req, res) => {
  let body = req.body;
  let createUser = await createGroup(body);
});

module.exports = GroupRouter;
