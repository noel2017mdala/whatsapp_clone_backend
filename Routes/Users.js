const express = require("express");
const {
  createUser,
  addContact,
  getUser,
  updateLastMassage,
} = require("../DB/Model/UserModel");
const userRouter = express.Router();

userRouter.post("/createUser", async (req, res) => {
  let body = req.body;
  if (body) {
    await createUser(body, (result) => {
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(400).json({
          message: "Failed to create user",
          result,
        });
      }
    });
  }
});

userRouter.put("/addContact/:id", async (req, res) => {
  let userId = req.params.id;
  let body = req.body;
  await addContact(userId, body, (result) => {
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(400).send(result);
    }
  });
});

userRouter.get("/getUser/:id", async (req, res) => {
  let userId = req.params.id;

  await getUser(userId, (result) => {
    if (result) {
      res.status(200).send(result);
    } else {
      {
        res.status(400).json({
          message: "User not found",
        });
      }
    }
  });
});
module.exports = userRouter;
