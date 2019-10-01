import mongoose from "mongoose";
const answerCommentSchema = new mongoose.Schema({
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
  createTime: Date,
  online: String,
  popUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});
export default answerCommentSchema;
