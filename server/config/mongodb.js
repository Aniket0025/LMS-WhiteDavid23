import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => { 
  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LMS-WhiteDavide23";
  const fallbackUri = "mongodb://127.0.0.1:27017/LMS-WhiteDavide23";

  try {
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected successfully to:", primaryUri.includes("@") ? "Remote Cluster" : primaryUri);
  } catch (error) {
    console.warn("⚠️ Primary MongoDB connection failed:", error.message);

    // If primary was remote and failed, try local fallback
    if (primaryUri !== fallbackUri) {
      try {
        console.log("🔄 Attempting fallback connection to local MongoDB:", fallbackUri);
        await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Connected to local MongoDB fallback database (LMS-WhiteDavide23)");
      } catch (fallbackError) {
        console.error("❌ Both primary and local MongoDB connections failed:", fallbackError.message);
      }
    }
  }
};

export default connectDB;