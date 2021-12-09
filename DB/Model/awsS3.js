let fs = require("fs");
const Aws = require("aws-sdk");
require("dotenv").config();
require("../AwsConfig");

let s3 = new Aws.S3({
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

// const bucketName = process.env.BUCKET_NAME;

const uploadObject = (filePath, keyName, bucketName, cb) => {
  let fileData = fs.readFileSync(filePath);

  const fileMetaData = {
    Bucket: bucketName,
    Key: keyName,
    Body: fileData,
  };

  s3.upload(fileMetaData, (err, data) => {
    if (err) {
      cb({
        status: false,
        message: "Failed to upload image",
      });
    } else {
      cb({
        status: true,
        message: "Image uploaded successfully",
        data: data.Location,
      });
    }
  });
};

const encode = (data) => {
  let buf = Buffer.from(data);
  let base64 = buf.toString("base64");
  return base64;
};

const getImage = async (id, bucketName, cb) => {
  let objectParams = {
    Bucket: bucketName,
    Key: id,
  };

  s3.getObject(objectParams, async (err, res) => {
    if (err) {
      // return {
      //   status: false,
      //   message: "Failed to retrieve the required image",
      // };

      cb({
        status: false,
        message: "Failed to retrieve the required image",
      });
    } else {
      let data = await s3.getObject(objectParams).createReadStream();
      cb({
        status: true,
        data,
      });
      // console.log(res.Body);
    }
  });

  // let data = s3.getObject(objectParams).promise();
  // data.then((data) => {
  //   // console.log(data);
  //   let image =
  //     "<img src='data:image/jpeg;base64," + encode(data.Body) + "'" + "/>";
  //   cb(image);
  // });

  // return s3.getObject(objectParams).createReadStream();
};
module.exports = {
  uploadObject,
  getImage,
};
