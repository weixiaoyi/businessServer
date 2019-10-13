import { Router, Authority, Db, Validator, Env } from "../../../components";
import { IdeaComment } from "../../../models";
import { ModelNames } from "../../../constants";

class IdeaCommentController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.commentView =
      "answerId accountId toAccountId ideaId comment createTime online popUser._id popUser.name popToUser._id popToUser.name";
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
    const { page, pageSize, ideaId, online } = req.query;
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
        field: "ideaId",
        type: "isMongoId"
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
        Model: IdeaComment,
        pagination: { page, pageSize },
        match: {
          ideaId: this.db.ObjectId(ideaId),
          ...(online ? { online } : {})
        },
        sort: {
          createTime: -1
        },
        lookup: [
          {
            from: ModelNames.user,
            localField: "accountId",
            foreignField: "_id",
            as: "popUser"
          },
          {
            from: ModelNames.user,
            localField: "toAccountId",
            foreignField: "_id",
            as: "popToUser"
          }
        ],
        project: this.commentView,
        map: item => {
          return {
            ...item,
            popUser: item.popUser[0],
            popToUser: item.popToUser[0]
          };
        }
      })
      .catch(this.handleSqlError);

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
    const { ideaId, comment, to } = req.body;
    const { _id } = req.session.user;
    const isValid = this.validator.validate(req.body, [
      {
        field: "comment",
        type: "isLength",
        payload: {
          min: 3,
          max: 500
        }
      },
      {
        field: "to",
        type: to ? "isMongoId" : undefined
      },
      {
        field: "ideaId",
        type: "isMongoId"
      }
    ]);
    if (!isValid || to === _id)
      return this.fail(res, {
        status: 400
      });
    const newComment = new IdeaComment({
      ideaId,
      comment,
      accountId: _id,
      createTime: Date.now(),
      online: req.blIsNormal ? "on" : "off",
      ...(to
        ? {
            toAccountId: to
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
