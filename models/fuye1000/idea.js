import mongoose from "mongoose";
import { ideaSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const Idea = mongoose.model(
  ModelNames.fuye.idea,
  ideaSchema,
  ModelNames.fuye.idea
);

export default Idea;
