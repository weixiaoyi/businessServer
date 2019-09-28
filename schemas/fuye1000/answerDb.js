import mongoose from "mongoose";
const answerDbSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  intro: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: String,
  online: String,
  createTime: Date,
  other: String,
  member: {
    limit: Number, // 非会员能够看到的页码,
    price: Number // 会员价格
  }
});
export default answerDbSchema;
