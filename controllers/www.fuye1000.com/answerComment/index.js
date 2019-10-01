import { Router, Authority } from "../../../components";
import { AnswerComment } from "../../../models";
import { ModelNames } from "../../../constants";

class AnswerCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.commentView = "answerId accountId comment popUser.name";
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
    const result = await this.handlePage({
      Model: AnswerComment,
      pagination: { page, pageSize },
      match: {
        answerId,
        ...(online ? { online } : {})
      },
      project: this.commentView,
      lookup: {
        from: ModelNames.user,
        localField: "accountId",
        foreignField: "_id",
        as: "popUser"
      },
      map: item => {
        return {
          ...item,
          popUser: item.popUser[0]
        };
      }
    }).catch(this.handleSqlError);

    if (!result) return this.fail(res);
    return this.success(res, {
      data: result.data,
      pagination: {
        page,
        pageSize,
        total: result.total
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
      online: "on"
    });
    const result = await newComment.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerCommentController().router;
