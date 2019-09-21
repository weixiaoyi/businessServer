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
  createTime: String,
  updateTime: String
});
export default answerSchema;
