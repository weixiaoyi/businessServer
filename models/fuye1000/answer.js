import mongoose from "mongoose";
import { answerSchema } from "../../schemas";
const Answer = mongoose.model("answer", answerSchema, "answer");

export default Answer;
