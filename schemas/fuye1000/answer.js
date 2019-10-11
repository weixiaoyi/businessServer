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
      required: true
    },
    questionId: String,
    authorName: String,
    authorId: String,
    content: {
      type: String,
      required: true
    },
    prevUpVoteNum: String,
    currentUpVoteNum: { type: Number, default: 1 },
    online: {
      type: String,
      required: true,
      enum: ["on", "off"]
    },
    dbName: {
      type: String,
      required: true
    },
    createTime: Date,
    updateTime: Date,
    other: String
  },
  { versionKey: false }
);
export default answerSchema;
