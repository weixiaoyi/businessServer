import mongoose from "mongoose";
const answerDbSchema = new mongoose.Schema({
  dbName: String,
  title: String,
  description: String,
  imageUrl: String,
  online: String,
  createTime: String,
  other: String
});
export default answerDbSchema;
