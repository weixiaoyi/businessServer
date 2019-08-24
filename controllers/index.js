import path from "path";
import { default as decryptController } from "./decrypt";
import { default as userController } from "./user";
import { default as payController } from "./pay";
import { default as yijianxiazaiControllers } from "./yijianxiazai.com";

const controllers = app => {
  app.use("/api", decryptController);
  app.use("/api/user", userController);
  app.use("/api/pay", payController);
  yijianxiazaiControllers(app);
  app.use("/yijiansucai", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../public/yijiansucai.html"))
  );
  app.use("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/index.html"));
  });
};

export default controllers;
