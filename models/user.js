import mongoose from "mongoose";
import { userSchema } from "../schemas";
import { ModelNames } from "../constants";

const User = mongoose.model(ModelNames.user, userSchema, ModelNames.user);

export default User;
