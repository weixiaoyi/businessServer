import svgCaptcha from "svg-captcha";
import { Router } from "../../components";

class CaptchaController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.router.get("/getCaptcha", this.getCaptcha);
  };

  getCaptcha = (req, res) => {
    const captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    return this.success(res, { data: captcha.data });
  };
}

export default new CaptchaController().router;
