import { Router, Authority } from "../../../components";
import { AnswerComment } from "../../../models";

class AnswerCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.commentView = "answerId comment";
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
    const commentConstructor = AnswerComment.find(
      limits,
      this.commentView
    ).toConstructor();
    const total = await commentConstructor()
      .countDocuments()
      .catch(this.handleSqlError);
    if (total === null) return this.fail(res);
    const data = await commentConstructor()
      .populate({
        path: "popUser",
        select: "name"
      })
      .sort({ createTime: -1 })
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data: data.map(item => ({
        answerId: item.answerId,
        comment: item.comment,
        name: item.popUser.name
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
    const { _id } = req.session.user;
    const newComment = new AnswerComment({
      answerId,
      comment,
      accountId: _id,
      createTime: Date.now(),
      online: "on",
      popUser: _id
    });
    const result = await newComment.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerCommentController().router;
