import mongoose from "mongoose";
const memberSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    detail: mongoose.Schema.Types.Mixed
  },
  { versionKey: false }
);
export default memberSchema;
