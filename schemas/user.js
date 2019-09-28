import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  domain: String,
  platform: String, //第三方账号平台
  userAgent: String, // pc,apple,linux,微信小程序，app
  phone: String,
  email: String,
  age: Number,
  sex: Number,
  avatar: String,
  address: String,
  createTime: Date,
  updateTime: Date,
  decrypt: String,
  other: String
});
export default userSchema;
