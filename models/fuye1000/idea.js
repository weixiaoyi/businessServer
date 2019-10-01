import mongoose from "mongoose";
import { ideaSchema } from "../../schemas";
import { ModelNames } from "../../constants";

const Idea = mongoose.model(ModelNames.idea, ideaSchema, ModelNames.idea);

export default Idea;
