import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: String,
  domain: {
    type: String,
    required: true
  },
  platform: String, //第三方账号平台
  userAgent: {
    type: String,
    required: true
  }, // pc,apple,linux,微信小程序，app
  phone: String,
  email: String,
  age: Number,
  sex: Number,
  avatar: String,
  address: String,
  createTime: Date,
  decrypt: {
    type: String,
    required: true,
    unique: true
  },
  other: String
});
export default userSchema;
