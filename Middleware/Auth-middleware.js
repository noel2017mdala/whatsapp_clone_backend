const jwt = require("jsonwebtoken");

const Auth = (req, res, next) => {
  let token = req.headers["access-token"];
  const user_id = req.headers["user-id"];

  if (token) {
    let secret = process.env.TOKEN_SECRET;
    // console.log(process.env.TOKEN_SECRET);
    jwt.verify(token, secret, (err, decode) => {
      if (err) {
        res.status(400).json({
          message: "user not authenticated",
        });
      } else if (user_id.toString() === decode.userId) {
        next();
      } else {
        res.status(400).json({
          message: "user not authenticated",
        });
      }
    });
  } else {
    res.status(400).json({
      message: "user not authenticated",
    });
  }
};

module.exports = Auth;
