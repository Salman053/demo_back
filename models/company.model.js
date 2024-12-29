"use strict";
import mongoose from "mongoose";

import bcrypt from "bcrypt";

const companySchema = new mongoose.Schema(
  {
    regNo: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
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

softwareCompanySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

softwareCompanySchema.methods.isPasswordCorrect = async function (password) {
  // new pass compare with the user hashed Password
  return await bcrypt.compare(password, this.password);
};

softwareCompanySchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
softwareCompanySchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

module.exports = mongoose.model("Company", companySchema);
