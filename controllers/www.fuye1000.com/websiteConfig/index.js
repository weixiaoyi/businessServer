import { Router, Authority, Validator } from "../../../components";
import { WebsiteConfig } from "../../../models";

class WebsiteConfigController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.validator = new Validator();
    this.router.get(
      "/getWebsiteConfig",
      [this.authority.checkAdmin],
      this.getWebsiteConfig
    );
    this.router.post(
      "/operationWebsiteConfig",
      [this.authority.checkAdmin],
      this.operationWebsiteConfig
    );
  };

  getWebsiteConfig = () => {};

  operationWebsiteConfig = () => {};
}

export default new WebsiteConfigController().router;
