const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Server connected to Database`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDb;
