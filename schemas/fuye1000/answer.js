import mongoose from "mongoose";
const answerSchema = new mongoose.Schema(
  {
    answerId: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    questionId: String,
    authorName: String,
    authorId: String,
    content: {
      type: String,
      required: true,
      trim: true
    },
    prevUpVoteNum: String,
    currentUpVoteNum: { type: Number, default: 1 },
    online: {
      type: String,
      required: true,
      enum: ["on", "off", "upload"]
    },
    dbName: {
      type: String,
      required: true,
      trim: true
    },
    createTime: Date,
    updateTime: Date,
    other: String,
    index: Number
  },
  { versionKey: false }
);
export default answerSchema;
