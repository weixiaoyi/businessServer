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
    online: {
      type: String,
      required: true,
      enum: ["on", "off"]
    },
    denyWhy: {
      type: String
    }
  },
  { versionKey: false }
);
export default ideaSchema;
