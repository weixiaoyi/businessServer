import mongoose from "mongoose";
import { answerSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const Answer = mongoose.model(
  ModelNames.answer,
  answerSchema,
  ModelNames.answer
);

export default Answer;
