import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({
  answerId: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  questionId: String,
  authorName: String,
  authorId: String,
  content: String,
  prevUpVoteNum: String,
  currentUpVoteNum: { type: Number, default: 1 },
  online: String,
  createTime: Date,
  updateTime: Date,
  dbName: String,
  other: String
});
export default answerSchema;
