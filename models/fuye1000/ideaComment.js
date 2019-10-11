import mongoose from "mongoose";
import { ideaCommentSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const IdeaComment = mongoose.model(
  ModelNames.fuye.ideaComment,
  ideaCommentSchema,
  ModelNames.fuye.ideaComment
);

export default IdeaComment;
