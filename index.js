import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();  

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/user", (req, res) => {
  res.send("hello world");
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
