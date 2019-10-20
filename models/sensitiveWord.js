import mongoose from "mongoose";
import { sensitiveWordSchema } from "../schemas";
import { ModelNames } from "../constants";

const SensitiveWord = mongoose.model(
  ModelNames.sensitiveWord,
  sensitiveWordSchema,
  ModelNames.sensitiveWord
);

export default SensitiveWord;
