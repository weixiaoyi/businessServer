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
  createTime: Date
});
export default ideaInterestSchema;
