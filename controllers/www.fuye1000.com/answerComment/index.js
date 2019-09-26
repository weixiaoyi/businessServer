import { Router, Authority } from "../../../components";
import { AnswerComment } from "../../../models";

class AnswerCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get("/getComments", this.getComments);
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
      .sort({ createTime: -1 })
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data: data.map(item => ({
        accountId: item.accountId,
        comment: item.comment,
        createTime: item.createTime
      })),
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  publishComment = async (req, res) => {
    const { answerId, comment } = req.body;
    if (
      !answerId ||
      !comment ||
      !comment.length ||
      comment.length > 200 ||
      comment.length < 10
    )
      return this.fail(res, {
        status: 400
      });
    const { accountId } = req.session.user;
    const newComment = new AnswerComment({
      answerId,
      comment,
      accountId,
      createTime: Date.now(),
      online: "off"
    });
    const result = await newComment.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerCommentController().router;
