import mongoose from "mongoose";
import { analysisSchema } from "../schemas";
const Analysis = mongoose.model("analysis", analysisSchema, "analysis");

export default Analysis;
