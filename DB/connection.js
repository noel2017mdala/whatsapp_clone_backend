let mongoose = require("mongoose");
const connection = async (cb) => {
  try {
    let connect = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0g2rn.mongodb.net/Whatsapp?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        keepAlive: true,
        dbName: "Whatsapp",
      }
    );
    if (connect) {
      cb(`Database Connected Successfully 🔥 🔥`);
    }
  } catch (error) {
    cb(`Failed to connect To the database please try again later`);
  }
};

module.exports = connection;
