import { Router, Authority, Db, Validator, Env } from "../../../components";
import { Idea } from "../../../models";
import { aggregate, trimHtml } from "../../../utils";
import { ModelNames } from "../../../constants";
import _ from "lodash";

class IdeaController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.ideaView = "accountId title content createTime popUser.name online";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get("/getIdeasPreview", this.getIdeasPreview);
    this.router.get("/getIdeaDetail", this.getIdeaDetail);
    this.router.post(
      "/publishIdea",
      [this.authority.checkLogin],
      this.publishIdea
    );
    this.router.put("/editIdea", [this.authority.checkLogin], this.editIdea);
  };

  getIdeasPreview = async (req, res) => {
    const { page, pageSize, online } = req.query;
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
        Model: Idea,
        pagination: { page, pageSize },
        match: {
          ...(online ? { online } : {})
        },
        sort: {
          createTime: -1
        },
        lookup: {
          from: ModelNames.ideaComment,
          localField: "_id",
          foreignField: "ideaId",
          as: "popIdeaComment"
        },
        project: aggregate.project(this.ideaView, {
          computedCommentsNum: {
            $size: {
              $filter: {
                input: "$popIdeaComment",
                as: "item",
                cond: { $eq: ["$$item.online", "on"] }
              }
            }
          }
        }),
        map: item => {
          return {
            ...item,
            brief: trimHtml(item.content, {
              limit: 30,
              preserveTags: false,
              wordBreak: true
            }).html
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
        project: this.ideaView,
        map: item => {
          return {
            ...item,
            popUser: item.popUser[0]
          };
        }
      })
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
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
      online: "on"
    });
    const result = await newIdea.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
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
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
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
