import mongoose from "mongoose";

const jobHistorySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true },
    applicationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["applied", "accepted", "rejected"], required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobHistory", jobHistorySchema);
