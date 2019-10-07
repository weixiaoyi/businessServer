import mongoose from "mongoose";
import { memberSchema } from "../schemas";
import { ModelNames } from "../constants";

const Member = mongoose.model(
  ModelNames.member,
  memberSchema,
  ModelNames.member
);

export default Member;
