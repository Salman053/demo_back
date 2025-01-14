import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "./db/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Configuration of CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse JSON requests
app.use(
  express.json({
    limit: "30kb",
  })
);

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

// Serve static files
app.use(express.static("public"));

// Cookie Parser
app.use(cookieParser());

// Connect to the database
// connectDatabase().catch((error) => {
//   console.error(
//     `MongoDB connection failed. Ensure your connection string is correct. ERROR: ${error}`
//   );
// });

// for testing purpose
connectDatabase()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((e) => {
    console.log(e);
  });

// Routes
import studentRoutes from "./routes/student.routes.js";
import authRoutes from "./routes/auth.routes.js";
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/auth", authRoutes);

// Export the app for Vercel
export default app;
