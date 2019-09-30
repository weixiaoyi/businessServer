import { Router, Authority } from "../../../components";
import { IdeaComment } from "../../../models";

class IdeaCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.commentView = "answerId toAccountId ideaId comment createTime";
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
    const { page, pageSize, ideaId, online } = req.query;
    if (!page || !pageSize || !ideaId)
      return this.fail(res, {
        status: 400
      });
    const limits = { ideaId, ...(online ? { online } : {}) };
    const commentConstructor = IdeaComment.find(
      limits,
      this.commentView
    ).toConstructor();
    const total = await commentConstructor()
      .countDocuments()
      .catch(this.handleSqlError);
    if (total === null) return this.fail(res);
    const data = await commentConstructor()
      .populate([
        {
          path: "popUser",
          select: "name"
        },
        {
          path: "popToUser",
          select: "name"
        }
      ])
      .sort({ createTime: -1 })
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data,
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  publishComment = async (req, res) => {
    const { ideaId, comment, to } = req.body;
    const { _id } = req.session.user;
    if (
      !ideaId ||
      !comment ||
      !comment.length ||
      comment.length > 500 ||
      comment.length < 3 ||
      (to && to === _id)
    )
      return this.fail(res, {
        status: 400
      });
    const newComment = new IdeaComment({
      ideaId,
      comment,
      accountId: _id,
      createTime: Date.now(),
      online: "on",
      popUser: _id,
      ...(to
        ? {
            toAccountId: to,
            popToUser: to
          }
        : {})
    });
    const result = await newComment.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new IdeaCommentController().router;
