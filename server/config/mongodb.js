import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => { 
  const isProd = process.env.NODE_ENV === "production";
  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LMS-WhiteDavide23";
  const fallbackUri = "mongodb://127.0.0.1:27017/LMS-WhiteDavide23";

  // Prevent Mongoose from buffering queries for 10s when disconnected
  mongoose.set("bufferCommands", false);
  mongoose.set("bufferTimeoutMS", 3000);

  // Monitor connection state changes
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB Connection Established");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Connection Lost");
  });

  if (isProd && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("127.0.0.1") || process.env.MONGODB_URI.includes("localhost"))) {
    console.error("\n==================================================================");
    console.error("🚨 CRITICAL CONFIGURATION NOTICE (Render Production):");
    console.error("   MONGODB_URI is not configured with a remote cloud database!");
    console.error("   Render does not have local MongoDB at 127.0.0.1.");
    console.error("   👉 Please set MONGODB_URI in Render Dashboard to a MongoDB Atlas cluster URI:");
    console.error("   Example: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/LMS?retryWrites=true&w=majority");
    console.error("==================================================================\n");
  }

  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log("✅ MongoDB Connected successfully to:", primaryUri.includes("@") ? "Remote MongoDB Cluster" : primaryUri);
  } catch (error) {
    console.warn("⚠️ Primary MongoDB connection failed:", error.message);

    // If not production and primary was remote, try local fallback
    if (!isProd && primaryUri !== fallbackUri) {
      try {
        console.log("🔄 Attempting fallback connection to local MongoDB:", fallbackUri);
        await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log("✅ Connected to local MongoDB fallback database (LMS-WhiteDavide23)");
      } catch (fallbackError) {
        console.error("❌ Both primary and local MongoDB connections failed:", fallbackError.message);
      }
    }
  }
};

export default connectDB;