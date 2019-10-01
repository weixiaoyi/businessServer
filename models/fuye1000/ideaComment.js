import mongoose from "mongoose";
import { ideaCommentSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const IdeaComment = mongoose.model(
  ModelNames.ideaComment,
  ideaCommentSchema,
  ModelNames.ideaComment
);

export default IdeaComment;
