import mongoose from "mongoose";
const answerCommentSchema = new mongoose.Schema({
  answerId: String,
  accountId: String,
  content: String,
  createTime: Date,
  online: String
});
export default answerCommentSchema;
