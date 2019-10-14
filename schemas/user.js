import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true,
      enum: ["fuye"]
    },
    platform: String, //第三方账号
    userAgent: {
      type: String,
      required: true,
      trim: true,
      enum: ["pc", "h5", "weixin", "app", "electron"]
    },
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
  },
  { versionKey: false }
);
export default userSchema;
