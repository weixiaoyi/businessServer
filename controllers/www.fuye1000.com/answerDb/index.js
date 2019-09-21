import { Router, Authority } from "../../../components";
import { AnswerDb } from "../../../models";

class AnswerDbController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get(
      "/getAnswerDbs",
      [this.authority.checkLogin],
      this.getAnswerDbs
    );
  };

  getAnswerDbs = async (req, res) => {
    const { page, pageSize } = req.query;
    const counts = await AnswerDb.countDocuments().catch(this.handleSqlError);
    const data = await AnswerDb.find()
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: counts
      }
    });
  };
}

export default new AnswerDbController().router;
