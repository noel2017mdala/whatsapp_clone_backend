const { response } = require("express");
const express = require("express");
const validator = require("email-validator");
const {
  createUser,
  addContact,
  getUser,
  login,
  getContactList,
  logUserOut,
} = require("../DB/Model/UserModel");
const Auth = require("../Middleware/Auth-middleware");
const userRouter = express.Router();

const regEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

const validateCreateUser = (data) => {
  let { name, email, password, phoneNumber } = data;

  if (name && email && password && phoneNumber) {
    if (name !== "" && email !== "" && password !== "" && phoneNumber !== "") {
      if (
        name.length <= 10 &&
        validator.validate(email) &&
        regEx.test(phoneNumber)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};
userRouter.post("/createUser", async (req, res) => {
  let body = req.body;
  let createUserValidator = validateCreateUser(body);

  if (createUserValidator) {
    if (body) {
      await createUser(body, (result) => {
        if (result) {
          res.status(200).send({
            result,
            status: true,
            message: "user created successfully",
          });
        } else {
          res.status(400).json({
            message: "Failed to create user !!",
            result,
          });
        }
      });
    }
  } else {
    {
      res.status(400).json({
        message: "Failed to create user !!",
      });
    }
  }
});

//this route use used when te user tries to log in

const validateLogin = (data) => {
  //regEx to check if a the given number is actually a number

  let { email, password } = data;

  /*
  verifying if a number is valid and the password field is not empty 
  */
  if (email && password) {
    if (regEx.test(email) && password !== "" && email.length === 10) {
      return true;
    } else {
      return false;
    }
  }
};
userRouter.post("/login", async (req, res) => {
  let body = req.body;

  //validate login details
  let getValidation = validateLogin(body);

  if (getValidation) {
    const loinDetails = await login(body);
    if (loinDetails) {
      let { userDetails, token } = loinDetails;

      let [header, payload, signature] = token.split(".");
      let headers = {
        header,
        payload,
      };
      //if login is a success assign cookies to user
      let loginDetails = {
        headers,
        userDetails,
        signature,
      };

      // res
      //   .status(200)
      //   .cookie("userPayLoad", headers, {
      //     sameSite: "none",
      //     secure: true,
      //     path: "/",
      //     expires: new Date(new Date().getTime() + 100000 * 10000),
      //   })
      //   .cookie("userData", userDetails, {
      //     sameSite: "none",
      //     secure: true,
      //     path: "/",
      //     expires: new Date(new Date().getTime() + 100000 * 10000),
      //   })
      //   .cookie("signature", signature, {
      //     sameSite: "none",
      //     secure: true,
      //     path: "/",
      //     expires: new Date(new Date().getTime() + 100000 * 10000),
      //     httpOnly: true,
      //   })
      //   .send("User");
      if (loginDetails) {
        res.status(200).send({
          status: true,
          loginDetails,
        });
      } else {
        res.status(400).json({
          Message: "Login Failed",
          status: false,
        });
      }
    } else {
      res.status(400).json({
        Message: "Login Failed",
        status: false,
      });
    }
  } else {
    res.status(400).json({
      Message: "Login Failed",
      status: false,
    });
  }
});

let validateAddContact = (data) => {
  if (data) {
    //Verify i
    let { contact } = data;
    if (contact) {
      if (regEx.test(contact)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  return false;
};
userRouter.put("/addContact/:id", Auth, async (req, res) => {
  let userId = req.params.id;
  let body = req.body;

  let validateUserContact = validateAddContact(body.body);

  if (validateUserContact) {
    await addContact(userId, body, (result) => {
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    });
  } else {
    res.status(400).json({
      message: "Failed to add contact please try again later",
    });
  }
});

userRouter.get("/getUser/:id", Auth, async (req, res) => {
  let userId = req.params.id;

  console.log(userId);

  if (userId) {
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
  } else {
    {
      res.status(400).json({
        message: "User not found",
      });
    }
  }
});

userRouter.get("/getContactList/:id", Auth, async (req, res) => {
  let userId = req.params.id;

  if (userId) {
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
      res.status(400).json({
        message: "user not found",
        status: false,
      });
    }
  } else {
    res.status(200).json({
      message: "users not found",
    });
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

userRouter.get("/logout/:id", Auth, async (req, res) => {
  if (req.params) {
    let logOutUserRes = await logUserOut(req.params.id);
    if (logOutUserRes) {
      res.status(200).send(logOutUserRes);
    } else {
      res.status(400).json({
        message: "Failed to log user out",
      });
    }
  }
});
module.exports = userRouter;
