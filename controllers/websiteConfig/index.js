import { Router, Authority, Validator } from "../../components";
import { WebsiteConfig } from "../../models";

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

  getWebsiteConfig = async (req, res) => {
    const { domain } = req.query;
    const isValid = this.validator.validate(req.query, [
      {
        field: "domain",
        type: "isIn",
        payload: ["fuye"]
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await WebsiteConfig.findOne({ domain }).catch(
      this.handleSqlError
    );
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  operationWebsiteConfig = async (req, res) => {
    const { domain, detail } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "domain",
        type: "isIn",
        payload: ["fuye"]
      },
      {
        field: "detail",
        type: "required"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await WebsiteConfig.findOneAndUpdate(
      { domain },
      {
        detail
      },
      { new: true, upsert: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new WebsiteConfigController().router;
