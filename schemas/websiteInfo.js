import mongoose from "mongoose";
const websiteInfoSchema = new mongoose.Schema(
  {
    host: String,
    cloudDiskUrls: [
      {
        desc: String,
        address: String,
        code: String
      }
    ]
  },
  { versionKey: false }
);
export default websiteInfoSchema;
