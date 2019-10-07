import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String
  },
  domain: {
    type: String,
    required: true
  },
  platform: String, //第三方账号平台
  userAgent: {
    type: String,
    required: true
  }, // pc,apple,linux,微信小程序，app
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  age: Number,
  sex: Number,
  avatar: String,
  address: String,
  createTime: {
    type: Date,
    required: true
  },
  decrypt: {
    type: String,
    required: true,
    unique: true
  },
  other: String
});
export default userSchema;
