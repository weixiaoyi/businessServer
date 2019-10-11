import mongoose from "mongoose";
const answerDbSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
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
    online: {
      type: String,
      required: true,
      enum: ["on", "off"]
    },
    createTime: {
      type: Date,
      required: true
    },
    other: String,
    member: {
      limit: {
        type: Number,
        required: true
      }, // 非会员能够看到的页码,
      price: {
        type: Number,
        required: true
      } // 会员价格
    }
  },
  { versionKey: false }
);
export default answerDbSchema;
