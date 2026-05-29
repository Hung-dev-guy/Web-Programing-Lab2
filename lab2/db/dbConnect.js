const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable
    });
    console.log("✅ Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("❌ Unable to connect to MongoDB Atlas!");
    console.error("   Reason:", error.message);
    console.error("   Check your DB_URL in .env and that your IP is whitelisted in Atlas.");
    // Don't crash the process — routes will return 503 via readyState check
  }
}

module.exports = dbConnect;
