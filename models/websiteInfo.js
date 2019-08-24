import mongoose from "mongoose";
import { websiteInfoSchema } from "../schemas";
const WebsiteInfo = mongoose.model(
  "websiteInfo",
  websiteInfoSchema,
  "websiteInfo"
);

export default WebsiteInfo;
