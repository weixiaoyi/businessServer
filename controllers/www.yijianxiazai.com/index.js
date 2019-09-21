import { default as userRecordController } from "./userRecord";
import { default as websiteInfoController } from "./websiteInfo";
const Controllers = app => {
  app.use("/yijianxiazai/api/userRecords", userRecordController);
  app.use("/yijianxiazai/api/websiteInfo", websiteInfoController);
};

export default Controllers;
