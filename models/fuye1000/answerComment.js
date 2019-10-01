import mongoose from "mongoose";
import { answerCommentSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const AnswerComment = mongoose.model(
  ModelNames.answerComment,
  answerCommentSchema,
  ModelNames.answerComment
);

export default AnswerComment;
