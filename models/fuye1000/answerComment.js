import mongoose from "mongoose";
import { answerCommentSchema } from "../../schemas";
import prefix from "./prefix";
const AnswerComment = mongoose.model(
  `${prefix}answerComment`,
  answerCommentSchema,
  `${prefix}answerComment`
);

export default AnswerComment;
