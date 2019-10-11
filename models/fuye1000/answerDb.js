import mongoose from "mongoose";
import { answerDbSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const AnswerDb = mongoose.model(
  ModelNames.fuye.answerDb,
  answerDbSchema,
  ModelNames.fuye.answerDb
);

export default AnswerDb;
