import mongoose from "mongoose";
import { ideaInterestSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const IdeaInterest = mongoose.model(
  ModelNames.ideaInterest,
  ideaInterestSchema,
  ModelNames.ideaInterest
);

export default IdeaInterest;
