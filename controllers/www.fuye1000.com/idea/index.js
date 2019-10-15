import { Router, Authority, Db, Validator, Env } from "../../../components";
import { Idea, IdeaComment, IdeaInterest } from "../../../models";
import { aggregate, trimHtml } from "../../../utils";
import { ModelNames } from "../../../constants";
import _ from "lodash";

class IdeaController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.ideaPreviewView = "accountId title createTime online denyWhy";
    this.ideaDetailView =
      "accountId title content createTime popUser._id popUser.name online";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get(
      "/getMyIdeas",
      [this.authority.checkLogin],
      this.getMyIdeas
    );
    this.router.get("/getIdeasPreview", this.getIdeasPreview);
    this.router.get("/getIdeaDetail", this.getIdeaDetail);
    this.router.post(
      "/publishIdea",
      [this.authority.checkLogin, this.authority.checkUserBl],
      this.publishIdea
    );
    this.router.put("/editIdea", [this.authority.checkLogin], this.editIdea);
    this.router.delete(
      "/deleteIdea",
      [this.authority.checkLogin],
      this.deleteIdea
    );
    this.router.put(
      "/inspectIdea",
      [this.authority.checkAdmin],
      this.inspectIdea
    );
  };

  getMyIdeas = async (req, res) => {
    req.query.mine = true;
    return this.getIdeasPreview(req, res);
  };

  getIdeasPreview = async (req, res) => {
    const { page, pageSize, online, mine } = req.query;
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
        field: "online",
        type: this.env.isCustomer(req) && !mine ? "equals" : undefined,
        payload: "on"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const _id = _.get(req.session, "user._id");
    const result = await this.db
      .handlePage({
        Model: Idea,
        pagination: { page, pageSize },
        match: {
          ...(online && !mine ? { online } : {}),
          ...(mine ? { accountId: this.db.ObjectId(_id) } : {})
        },
        sort: {
          createTime: -1
        },
        lookup: [
          {
            from: ModelNames.fuye.ideaComment,
            localField: "_id",
            foreignField: "ideaId",
            as: "popIdeaComment"
          },
          {
            from: ModelNames.fuye.ideaInterest,
            localField: "_id",
            foreignField: "ideaId",
            as: "popIdeaInterest"
          }
        ],
        project: aggregate.project(this.ideaPreviewView, {
          computedInterestNum: {
            $size: "$popIdeaInterest"
          },
          computedIsInterest: {
            $in: [
              this.db.ObjectId(_id),
              {
                $map: {
                  input: "$popIdeaInterest",
                  as: "interest",
                  in: "$$interest.accountId"
                }
              }
            ]
          },
          computedCommentsNum: {
            $size: {
              $filter: {
                input: "$popIdeaComment",
                as: "item",
                cond: { $eq: ["$$item.online", "on"] }
              }
            }
          },
          content: 1
        }),
        map: item => {
          return {
            ...item,
            content: undefined,
            brief: trimHtml(item.content, {
              limit: 30,
              preserveTags: false,
              wordBreak: true
            }).html
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

  getIdeaDetail = async (req, res) => {
    const { id } = req.query;
    const isValid = this.validator.validate(req.query, [
      {
        field: "id",
        type: "isMongoId"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const data = await this.db
      .handleAggregate({
        Model: Idea,
        match: {
          _id: this.db.ObjectId(id)
        },
        lookup: {
          from: ModelNames.user,
          localField: "accountId",
          foreignField: "_id",
          as: "popUser"
        },
        project: this.ideaDetailView,
        map: item => {
          return {
            ...item,
            popUser: item.popUser[0]
          };
        }
      })
      .catch(this.handleError);
    if (this.isError(data) || this.isNull(data)) return this.fail(res);
    if (!_.get(data, "length"))
      return this.fail(res, {
        status: 400,
        msg: "未找到指定的副业"
      });
    return this.success(res, {
      data: data[0]
    });
  };

  publishIdea = async (req, res) => {
    const { title, content } = req.body;
    if (!this.checkRequiredParams(title, content))
      return this.fail(res, {
        status: 400
      });
    const { _id } = req.session.user;
    const newIdea = new Idea({
      accountId: _id,
      title,
      content,
      createTime: Date.now(),
      online: req.blIsNormal ? "on" : "off"
    });
    const result = await newIdea.save().catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  editIdea = async (req, res) => {
    // 注意判断权限
    const { id, title, content } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "id",
        type: "isMongoId"
      }
    ]);
    if (!isValid || !this.checkRequiredParams(title, content))
      return this.fail(res, {
        status: 400
      });
    const { _id } = req.session.user;
    const result = await Idea.findOneAndUpdate(
      { _id: id, accountId: _id },
      { title, content },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  deleteIdea = async (req, res) => {
    const { ideaId } = req.body;
    const { _id } = req.session.user;
    const isValid = this.validator.validate(req.body, [
      {
        field: "ideaId",
        type: "isMongoId"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await Promise.all([
      Idea.findOneAndRemove(
        {
          _id: ideaId,
          accountId: _id
        },
        { new: true }
      ),
      IdeaInterest.findOneAndRemove(
        {
          ideaId
        },
        { new: true }
      ),
      IdeaComment.deleteMany(
        {
          ideaId
        },
        { new: true }
      )
    ]).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  inspectIdea = async (req, res) => {
    const { id, online, denyWhy } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "id",
        type: "isMongoId"
      },
      {
        field: "online",
        type: "isIn",
        payload: ["on", "off"]
      },
      {
        field: "denyWhy",
        type: online === "off" ? "required" : undefined
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await Idea.findByIdAndUpdate(
      { _id: id },
      { online, denyWhy: online === "on" ? "" : denyWhy },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  checkRequiredParams = (title, content) => {
    const html = trimHtml(content, { limit: 5000, preserveTags: false }).html;
    return this.validator.validate(undefined, [
      {
        value: content,
        type: "required"
      },
      {
        value: title,
        type: "isLength",
        payload: {
          min: 5,
          max: 20
        }
      },
      {
        value: html,
        type: "isLength",
        payload: {
          min: 20,
          max: 1500
        }
      }
    ]);
  };
}

export default new IdeaController().router;
