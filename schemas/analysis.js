import mongoose from "mongoose";
const analysisSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true,
      enum: ["fuye"]
    },
    // userInfoAndAction
    ip: {
      type: String,
      trim: true
    },
    userAgent: mongoose.Schema.Types.Mixed,
    stayTime: {
      type: Number
    },
    userInfo: mongoose.Schema.Types.Mixed,
    records: [[mongoose.Schema.Types.Mixed]],
    createTime: {
      type: Date,
      required: true
    },
    dataType: {
      type: String,
      required: true,
      enum: ["userInfoAndAction", "error"]
    }
  },
  { versionKey: false }
);
export default analysisSchema;
