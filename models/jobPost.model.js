import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    salaryEstimated: { type: Number, required: true },
    description: { type: String, required: true },
    tags: [String],
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    // requiredDocs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UploadedMedia' }],
  }, { timestamps: true });
  
  module.exports = mongoose.model('JobPost', jobPostSchema);
  