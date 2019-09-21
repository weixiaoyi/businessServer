import mongoose from "mongoose";
import { answerDbSchema } from "../../schemas";
const AnswerDb = mongoose.model("answerDb", answerDbSchema, "answerDb");

export default AnswerDb;
