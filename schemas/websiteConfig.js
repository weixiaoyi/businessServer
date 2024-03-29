import mongoose from "mongoose";
const websiteConfigSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      enum: ["fuye"]
    },
    detail: mongoose.Schema.Types.Mixed
  },
  { versionKey: false }
);
export default websiteConfigSchema;
