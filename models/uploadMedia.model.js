import mongoose from "mongoose";


const uploadedMediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userType", required: true },
    userType: { type: String, enum: ["Student", "Company"], required: true },
    size: { type: String, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UploadedMedia", uploadedMediaSchema);
