import mongoose from "mongoose";
const sensitiveWordSchema = new mongoose.Schema(
  {
    word: {
      type: "String",
      required: true,
      unique: true
    }
  },
  { versionKey: false }
);
export default sensitiveWordSchema;
