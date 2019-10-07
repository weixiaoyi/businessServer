import mongoose from "mongoose";
const memberSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  detail: mongoose.Schema.Types.Mixed
});
export default memberSchema;
