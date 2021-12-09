const Aws = require("aws-sdk");
Aws.config.update({
  region: process.env.AWS_REGION,
});

let AwsConnection = Aws.config.getCredentials((err) => {
  if (err) {
    console.log("Failed to connect to aws ");
  } else {
    console.log("connection successful to Aws 🌩");
  }
});

module.exports = AwsConnection;
