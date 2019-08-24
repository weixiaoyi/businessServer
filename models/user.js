import mongoose from "mongoose";
import { userSchema } from "../schemas";
const User = mongoose.model("user", userSchema, "user");

export default User;
