import mongoose from "mongoose";
import { analysisSchema } from "../schemas";
import { ModelNames } from "../constants";
const Analysis = mongoose.model(
  ModelNames.analysis,
  analysisSchema,
  ModelNames.analysis
);

export default Analysis;
