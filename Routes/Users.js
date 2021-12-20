const { response } = require("express");
const express = require("express");
const validator = require("email-validator");
const sharp = require("sharp");
require("dotenv").config();
const path = require("path");
const multer = require("multer");
const {
  createUser,
  addContact,
  getUser,
  login,
  getContactList,
  logUserOut,
  updateProfile,
  getUserData,
  updateProfileWithImage,
} = require("../DB/Model/UserModel");
const { getImage } = require("../DB/Model/awsS3");
const Auth = require("../Middleware/Auth-middleware");
const userRouter = express.Router();

const regEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const bucketName = process.env.BUCKET_NAME;

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
      return cb({
        status: false,
        message: "Please user the correct image format",
      });
    }
    cb(undefined, true);
  },
});

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
        if (result.status) {
          res.status(200).send({
            result,
          });
        } else {
          res.status(400).json({
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
    console.log(loinDetails);
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
userRouter.put(
  "/updateProfile",
  Auth,
  upload.single("file"),
  async (req, res) => {
    // console.log(req.file);
    if (req.file) {
      let file = req.file;
      const obj = JSON.parse(JSON.stringify(req.body));
      let genId = req.body.Uid;
      const uploadSharp = await sharp(file.path)
        .resize({ width: 200, height: 200 })
        .png()
        .toFile(`public/userProfiles/${genId}.png`);

      await updateProfileWithImage(
        {
          file,
          obj,
          genId,
        },
        (response) => {
          // console.log(res);
          if (response.status) {
            res.status(200).json({
              status: true,
              message: "Profile updated successfully",
            });
          } else {
            res.status(400).json({
              status: false,
              message: "Failed to update profile",
            });
          }
        }
      );
    } else {
      const obj = JSON.parse(JSON.stringify(req.body));
      let updateUserProfile = await updateProfile(obj);
      if (updateUserProfile.status) {
        res.status(200).json(updateUserProfile);
      }
    }
  }
);
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

userRouter.get("/getUserData/:id", Auth, async (req, res) => {
  let id = req.params.id;
  let getUser = await getUserData(id);
  res.send(getUser);
});

userRouter.get("/getImage/:imageId", async (req, res) => {
  if (req.params.imageId) {
    const { imageId } = req.params;
    // await getImage(imageId, bucketName, (data) => {
    //   console.log(data);

    //   return;
    //   if (data.status) {
    //     const b64 = Buffer.from(data.res.Body).toString("base64");
    //     const mimeType = "image/png";
    //     // res.send(data.Body);
    //     res.send(`<img src="data:${mimeType};base64,${b64}" />`);
    //   }
    // });

    const demo = getImage(imageId, bucketName, async (data) => {
      if (data.status) {
        let image = data.data;
        (await image).pipe(res);
      } else {
        res.status(400).json({
          message: "Image not found",
        });
      }
    });
  }
});
module.exports = userRouter;
