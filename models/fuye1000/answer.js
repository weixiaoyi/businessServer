import mongoose from "mongoose";
import { answerSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const Answer = mongoose.model(
  ModelNames.fuye.answer,
  answerSchema,
  ModelNames.fuye.answer
);

export default Answer;
