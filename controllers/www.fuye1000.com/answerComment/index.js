import { Router, Authority } from "../../../components";
import { AnswerComment } from "../../../models";

class AnswerCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get(
      "/getComments",
      [this.authority.checkLogin],
      this.getComments
    );
    this.router.post(
      "/publishComment",
      [this.authority.checkLogin],
      this.publishComment
    );
  };

  getComments = async (req, res) => {
    const { page, pageSize, answerId, online } = req.query;
    if (!page || !pageSize || !answerId)
      return this.fail(res, {
        status: 400
      });
    const limits = { answerId, ...(online ? { online } : {}) };
    const total = await AnswerComment.find(limits)
      .countDocuments()
      .catch(this.handleSqlError);
    if (total === null) return this.fail(res);
    const data = await AnswerComment.find(limits)
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data: data,
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  publishComment = () => {};
}

export default new AnswerCommentController().router;
