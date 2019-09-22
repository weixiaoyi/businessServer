import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({
  answerId: String,
  title: String,
  questionId: String,
  authorName: String,
  authorId: String,
  content: String,
  prevUpVoteNum: String,
  currentUpVoteNum: String,
  online: String,
  createTime: Date,
  updateTime: Date,
  dbName: String,
  other: String
});
export default answerSchema;
