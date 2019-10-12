import mongoose from "mongoose";
const userBlackListSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    },
    type: {
      type: "String",
      required: true,
      enum: ["normal", "inspecting", "forbidden"]
    },
    updateTime: {
      type: Date,
      required: true
    },
    why: {
      type: String
    },
    normalTimes: {
      type: Number
    },
    inspectTimes: {
      type: Number
    },
    forbiddenTimes: {
      type: Number
    }
  },
  { versionKey: false }
);
export default userBlackListSchema;
