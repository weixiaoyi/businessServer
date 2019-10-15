import requestIp from "request-ip";
import { Router } from "../../components";
import { Analysis } from "../../models";

class AnalysisController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.router.post("/recordAnalysis", this.recordAnalysis);
  };

  recordAnalysis = (req, res) => {
    const ip = requestIp.getClientIp(req);
    const {
      domain,
      userAgent,
      userInfo,
      dataType,
      createTime,
      stayTime,
      records
    } = req.body;
    let submit = {
      domain,
      userAgent,
      userInfo,
      dataType,
      createTime,
      ip
    };
    if (dataType === "error") {
      submit.stayTime = stayTime;
      submit.records = records;
    }
    const analysis = new Analysis(submit);
    const result = analysis.save().catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res);
  };
}

export default new AnalysisController().router;
