import mongoose from "mongoose";
import { userNavSchema } from "../../schemas";
const UserNav = mongoose.model("userNav", userNavSchema, "userNav");

export default UserNav;
