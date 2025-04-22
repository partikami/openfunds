import mongoose from "mongoose";

const uri = process.env.ATLAS_URI || "";
console.log(uri);

const connectDB = async () => {
  try {
    // Set up default mongoose connection
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // 1 indicates an error occurred, 0 indicates success.
  }
};

export default connectDB;
