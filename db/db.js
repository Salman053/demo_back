import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const mongoDBURL = "mongodb://localhost:27017/SkillFusion";
// Connect to MongoDB

export const connectDatabase = async () => {
  try {
    const mongoDBInstance = await mongoose.connect(
      process.env.NODE_ENV === "development"
        ? mongoDBURL
        : process.env.MONGODB_URL
    );
    console.log(
      `\n MongoDB connection established with database ${DB_NAME} ${
        process.env.NODE_ENV === "development"
          ? mongoDBURL
          : process.env.MONGODB_URL
      }`
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
