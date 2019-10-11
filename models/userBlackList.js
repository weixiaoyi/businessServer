import mongoose from "mongoose";
import { userBlackListSchema } from "../schemas";
import { ModelNames } from "../constants";

const UserBlackList = mongoose.model(
  ModelNames.userBlackList,
  userBlackListSchema,
  ModelNames.userBlackList
);

export default UserBlackList;
