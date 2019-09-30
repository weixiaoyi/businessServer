import mongoose from "mongoose";
import { ideaCommentSchema } from "../../schemas";
import prefix from "./prefix";
const IdeaComment = mongoose.model(
  `${prefix}ideaCommentSchema`,
  ideaCommentSchema,
  `${prefix}ideaCommentSchema`
);

export default IdeaComment;
