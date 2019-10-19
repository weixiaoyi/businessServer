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
    this.router.get("/getWebsiteConfig", this.getWebsiteConfig);
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
      this.handleError
    );
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  operationWebsiteConfig = async (req, res) => {
    const { domain, detail } = req.body;
    const { siteMemberPrice, notifies } = detail;
    const isValid = this.validator.validate(undefined, [
      {
        value: domain,
        type: "isIn",
        payload: ["fuye"]
      },
      {
        value: siteMemberPrice,
        type: "isInt"
      }
    ]);
    if (
      !isValid ||
      (notifies &&
        !notifies.every(item => item.content && item.date && item.type))
    )
      return this.fail(res, {
        status: 400
      });

    const result = await WebsiteConfig.findOneAndUpdate(
      { domain },
      {
        detail: {
          siteMemberPrice,
          ...(notifies ? { notifies } : {})
        }
      },
      { new: true, upsert: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new WebsiteConfigController().router;
