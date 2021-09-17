const multer = require("multer");

const REQUIRED_FILE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let isValid = REQUIRED_FILE_TYPE[file.mimetype];
    let uploadError = new Error("Invalid Image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const uniqueSuffix = file.originalname.replace(" ", "-");
    cb(null, `${file.fieldname}-${Date.now()}-${uniqueSuffix}`);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
