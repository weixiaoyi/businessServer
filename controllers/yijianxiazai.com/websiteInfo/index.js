import { Router, Authority } from "../../../components";
import { WebsiteInfo } from "../../../models";

class WebsiteInfoController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get(
      "/getCloudDiskUrls",
      [this.authority.checkLogin],
      this.getCloudDiskUrls
    );
  };

  getCloudDiskUrls = async (req, res) => {
    const results = await WebsiteInfo.findOne(
      {
        host: "yijianxiazai"
      },
      "cloudDiskUrls"
    ).catch(this.handleSqlError);
    if (!results) return this.fail(res);
    return this.success(res, {
      data: results.cloudDiskUrls.map(({ desc, address, code }) => ({
        desc,
        address,
        code
      }))
    });
  };
}

export default new WebsiteInfoController().router;
