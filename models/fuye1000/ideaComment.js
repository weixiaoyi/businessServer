import mongoose from "mongoose";
import { ideaCommentSchema } from "../../schemas";
import prefix from "./prefix";
const IdeaComment = mongoose.model(
  `${prefix}ideaComment`,
  ideaCommentSchema,
  `${prefix}ideaComment`
);

export default IdeaComment;
