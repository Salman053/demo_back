import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const companySchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    name: { type: String, required: false },
    email: { type: String, unique: true, required: false },
    password: { type: String, required: true },
    workingTechs: [String],
    location: { type: String },
    interests: [String],
    address: { type: String },
    description: { type: String },
    alerts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Alert" }],
  },
  { timestamps: true }
);

companySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

companySchema.methods.isPasswordCorrect = async function (password) {
  // new pass compare with the user hashed Password
  return await bcrypt.compare(password, this.password);
};

companySchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
companySchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Company = mongoose.model("Company", companySchema);
