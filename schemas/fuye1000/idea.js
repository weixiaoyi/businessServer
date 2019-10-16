import mongoose from "mongoose";
const ideaSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createTime: {
      type: Date,
      required: true
    },
    updateTime: {
      type: Date
    },
    online: {
      type: String,
      required: true,
      enum: ["on", "off"]
    },
    denyWhy: {
      type: String
    },
    denyTimes: {
      type: Number
    }
  },
  { versionKey: false }
);
export default ideaSchema;
