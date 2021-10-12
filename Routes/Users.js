const express = require("express");
const {
  createUser,
  addContact,
  getUser,
  login,
  getContactList,
} = require("../DB/Model/UserModel");
const userRouter = express.Router();

userRouter.post("/createUser", async (req, res) => {
  let body = req.body;
  if (body) {
    await createUser(body, (result) => {
      if (result) {
        console.log(result);
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

userRouter.post("/login", async (req, res) => {
  let body = req.body;
  const loinDetails = await login(body);
  if (loinDetails) {
    let { userDetails, token } = loinDetails;

    let [header, payload, signature] = token.split(".");
    let headers = {
      header,
      payload,
    };
    res
      .status(200)
      .cookie("userPayLoad", headers, {
        sameSite: "strict",
        path: "/",
        expires: new Date(new Date().getTime() + 100000 * 10000),
      })
      .cookie("userData", userDetails, {
        sameSite: "strict",
        path: "/",
        expires: new Date(new Date().getTime() + 100000 * 10000),
      })
      .cookie("signature", signature, {
        sameSite: "strict",
        path: "/",
        expires: new Date(new Date().getTime() + 100000 * 10000),
        httpOnly: true,
      })
      .send("User");
  } else {
    res.status(400).json({
      Message: "Login Failed",
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
    } else if (result === undefined) {
      res.status(200).json({
        message: "User not found",
      });
    } else {
      {
        res.status(400).json({
          message: "User not found",
        });
      }
    }
  });
});

userRouter.get("/getContactList/:id", async (req, res) => {
  let userId = req.params.id;

  let fetchContactList = await getContactList(userId);
  if (fetchContactList) {
    if (fetchContactList.length > 0) {
      res.status(200).send(fetchContactList);
    } else {
      res.status(200).json({
        message: "users not found",
      });
    }
  } else {
    res.status(400).send(false);
  }
  // await getUser(userId, (result) => {
  //   if (result) {
  //     res.status(200).send(result);
  //   } else if (result === undefined) {
  //     res.status(200).json({
  //       message: "User not found",
  //     });
  //   } else {
  //     {
  //       res.status(400).json({
  //         message: "User not found",
  //       });
  //     }
  //   }
  // });
});

module.exports = userRouter;
