import mongoose from "mongoose";
import { answerCommentSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const AnswerComment = mongoose.model(
  ModelNames.fuye.answerComment,
  answerCommentSchema,
  ModelNames.fuye.answerComment
);

export default AnswerComment;
