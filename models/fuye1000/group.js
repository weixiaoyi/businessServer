import mongoose from "mongoose";
import { groupScheme } from "../../schemas";
const Group = mongoose.model("group", groupScheme, "group");

export default Group;
