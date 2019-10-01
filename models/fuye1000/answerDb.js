import mongoose from "mongoose";
import { answerDbSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const AnswerDb = mongoose.model(
  ModelNames.answerDb,
  answerDbSchema,
  ModelNames.answerDb
);

export default AnswerDb;
