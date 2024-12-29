import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userType", required: true },
    userType: { type: String, enum: ["Student", "Company"], required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["jobUpdate", "projectUpdate", "reportFeedback", "newCourse"],
      required: true,
    },
    readStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
