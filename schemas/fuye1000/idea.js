import mongoose from "mongoose";
const ideaSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  brief: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createTime: Date,
  online: String,
  popUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
});
export default ideaSchema;
