import { Router } from "../../components";

class AnalysisController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.router.post("/recordInfo", this.recordInfo);
  };

  recordInfo = (req, res) => {};
}

export default new AnalysisController().router;
