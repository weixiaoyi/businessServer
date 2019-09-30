import mongoose from "mongoose";
const ideaCommentSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true
  },
  toAccountId: String,
  ideaId: {
    type: String,
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
  },
  popToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});
export default ideaCommentSchema;
