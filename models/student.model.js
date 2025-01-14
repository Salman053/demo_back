import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const studentSchema = new mongoose.Schema(
  {
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
    username: { type: String, required: true, unique: true, uppercase: true },
    fullName: { type: String, required: false },
    email: { type: String, unique: true, required: true },
    profilePic: { type: String },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    skills: [String],
    interests: [String],
    role: { type: String, default: "student" },
    address: [String],
    refreshToken: { type: String },
    location: { type: String },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "UploadedMedia" }],
    alerts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Alert" }],

    // check the prevoius
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
studentSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Student = model("Students", studentSchema);
