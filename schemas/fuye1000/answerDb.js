import mongoose from "mongoose";
const answerDbSchema = new mongoose.Schema({
  name: String,
  desc: String,
  title: String,
  intro: String,
  imageUrl: String,
  online: String,
  createTime: String,
  other: String,
  member: {
    limit: Number, // 非会员能够看到的页码,
    price: Number // 会员价格
  }
});
export default answerDbSchema;
