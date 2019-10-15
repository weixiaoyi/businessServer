import { Router, Authority, Db, Validator, Env } from "../../../components";
import { AnswerComment } from "../../../models";
import { ModelNames } from "../../../constants";

class AnswerCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.commentView = "answerId accountId comment popUser._id popUser.name";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get("/getComments", this.getComments);
    this.router.post(
      "/publishComment",
      [this.authority.checkLogin, this.authority.checkUserBl],
      this.publishComment
    );
  };

  getComments = async (req, res) => {
    const { page, pageSize, answerId, online } = req.query;
    const isValid = this.validator.validate(req.query, [
      {
        field: "page",
        type: "isInt"
      },
      {
        field: "pageSize",
        type: "isInt"
      },
      {
        field: "answerId",
        type: "required"
      },
      {
        field: "online",
        type: this.env.isCustomer(req) ? "equals" : undefined,
        payload: "on"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await this.db
      .handlePage({
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
        sort: {
          createTime: -1
        },
        map: item => {
          return {
            ...item,
            popUser: item.popUser[0]
          };
        }
      })
      .catch(this.handleError);

    if (this.isError(result) || this.isNull(result)) return this.fail(res);
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
    const isValid = this.validator.validate(req.body, [
      {
        field: "answerId",
        type: "required"
      },
      {
        field: "comment",
        type: "isLength",
        payload: {
          min: 10,
          max: 200
        }
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const { _id } = req.session.user;
    const newComment = new AnswerComment({
      answerId,
      comment,
      accountId: _id,
      createTime: Date.now(),
      online: req.blIsNormal ? "on" : "off"
    });
    const result = await newComment.save().catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerCommentController().router;
