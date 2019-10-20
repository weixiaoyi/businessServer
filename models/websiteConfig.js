import mongoose from "mongoose";
import { websiteConfigSchema } from "../schemas";
import { ModelNames } from "../constants";
const WebsiteConfig = mongoose.model(
  ModelNames.websiteConfig,
  websiteConfigSchema,
  ModelNames.websiteConfig
);

export default WebsiteConfig;
