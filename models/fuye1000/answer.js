import mongoose from "mongoose";
import { answerSchema } from "../../schemas";
import prefix from "./prefix";
const Answer = mongoose.model(
  `${prefix}answer`,
  answerSchema,
  `${prefix}answer`
);

export default Answer;
