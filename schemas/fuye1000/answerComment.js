import mongoose from "mongoose";
const answerCommentSchema = new mongoose.Schema(
  {
    answerId: {
      type: String,
      required: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    comment: {
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
export default answerCommentSchema;
