import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "./db/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
// configuration of the cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// configuration of the express json to except the json from data
app.use(
  express.json({
    limit: "30kb",
  })
);
//configuration of the express urlencoded connection
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

app.use(express.json());

// configuration of the static files
app.use(express.static("public"));

// configuration of the cookie-parser to send secure cookies
app.use(cookieParser());



connectDatabase()
  .then(() => {
    app.listen(process.env.PORT || 6000, () => {
      console.log(
        `*#____#* Server is listening on Port ${process.env.PORT} *****Happy Coding*****`
      );
    });
  })
  .catch((error) => {
    console.log(
      `mongoDB error while connection the connection is failed ERROR : ${error}`
    );
  });

// routes



//import Routes
import studentRoutes from "./routes/student.routes.js";

app.use("/api/v1/student", studentRoutes);

app.get("/api/users", (req, res) => {
  res.send("Hello");
});

