import mongoose from "mongoose";
const ideaCommentSchema = new mongoose.Schema(
  {
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
    createTime: {
      type: Date,
      required: true
    },
    online: {
      type: String,
      required: true
    }
  },
  { versionKey: false }
);
export default ideaCommentSchema;
