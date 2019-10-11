import mongoose from "mongoose";
import { ideaInterestSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const IdeaInterest = mongoose.model(
  ModelNames.fuye.ideaInterest,
  ideaInterestSchema,
  ModelNames.fuye.ideaInterest
);

export default IdeaInterest;
