import rateLimit from "express-rate-limit";
import { default as decryptController } from "./decrypt";
import { default as userController } from "./user";
import { default as captchaController } from "./captcha";
import { default as userBlackListController } from "./userBlackList";
import { default as payControllerController } from "./pay";
import { default as websiteConfigController } from "./websiteConfig";
import { default as analysisController } from "./analysis";
import { default as sensitiveWordController } from "./sensitiveWord";

import { default as yijianxiazaiControllers } from "./www.yijianxiazai.com";
import { default as fuye1000Controllers } from "./www.fuye1000.com";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 50,
  handler: (req, res) =>
    res.status(429).json({
      code: -1,
      msg: "请求太频繁啦，休息一会儿再尝试吧！"
    })
});

const controllers = app => {
  app.use("*/api", limiter, decryptController);
  app.use("/api/captcha", captchaController);
  app.use("/api/user", userController);
  app.use("/api/userBlackList", userBlackListController);
  app.use("/api/pay", payControllerController);
  app.use("/api/websiteConfig", websiteConfigController);
  app.use("/api/analysis", analysisController);
  app.use("/api/sensitiveWord", sensitiveWordController);
  yijianxiazaiControllers(app);
  fuye1000Controllers(app);
};

export default controllers;
