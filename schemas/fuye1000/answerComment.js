import mongoose from "mongoose";
const answerCommentSchema = new mongoose.Schema({
  answerId: String,
  accountId: String,
  comment: String,
  createTime: Date,
  online: String,
  popUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});
export default answerCommentSchema;
