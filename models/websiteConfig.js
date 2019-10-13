import mongoose from "mongoose";
import { websiteConfigSchema } from "../schemas";
const WebsiteConfig = mongoose.model(
  "websiteConfig",
  websiteConfigSchema,
  "websiteConfig"
);

export default WebsiteConfig;
