const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://yarlagaddalath43:AMOdauSgFRvYOrfr@cluster1.ntvfxga.mongodb.net/attendanceDB?retryWrites=true&w=majority&appName=Cluster1");
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
