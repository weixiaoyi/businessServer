import mongoose from "mongoose";
const ideaCommentSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createTime: Date,
  online: String
});
export default ideaCommentSchema;
