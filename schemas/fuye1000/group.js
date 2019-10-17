import mongoose from "mongoose";
const groupSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    desc: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      required: true,
      trim: true
    },
    createTime: Date,
    updateTime: Date,
    index: Number
  },
  { versionKey: false }
);
export default groupSchema;
