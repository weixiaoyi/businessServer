import mongoose from "mongoose";
import { ideaSchema } from "../../schemas";
import prefix from "./prefix";
const Idea = mongoose.model(`${prefix}idea`, ideaSchema, `${prefix}idea`);

export default Idea;
