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
  createTime: String,
  updateTime: String,
  dbName: String,
  other: String
});
export default answerSchema;
