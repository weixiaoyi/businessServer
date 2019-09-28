import mongoose from "mongoose";
const ideaSchema = new mongoose.Schema({
  answerId: String,
  accountId: String,
  comment: String,
  createTime: Date,
  online: String
});
export default ideaSchema;
