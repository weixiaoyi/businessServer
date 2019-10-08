import { default as decryptController } from "./decrypt";
import { default as userController } from "./user";
import { default as payController } from "./pay";
import { default as yijianxiazaiControllers } from "./www.yijianxiazai.com";
import { default as fuye1000Controllers } from "./www.fuye1000.com";

const controllers = app => {
  app.use("*/api", decryptController);
  app.use("/api/user", userController);
  app.use("/api/pay", payController);
  yijianxiazaiControllers(app);
  fuye1000Controllers(app);
};

export default controllers;
