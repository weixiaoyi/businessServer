import mongoose from "mongoose";
const ideaInterestSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createTime: {
    type: Date,
    required: true
  }
});
export default ideaInterestSchema;
