import mongoose from "mongoose";
import { answerDbSchema } from "../../schemas";
import prefix from "./prefix";
const AnswerDb = mongoose.model(
  `${prefix}answerDb`,
  answerDbSchema,
  `${prefix}answerDb`
);

export default AnswerDb;
