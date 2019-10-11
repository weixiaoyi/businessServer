import { Router, Authority, Db, Validator, Env } from "../../../components";
import { IdeaInterest } from "../../../models";
import { ModelNames } from "../../../constants";
import { aggregate, trimHtml } from "../../../utils";

class IdeaInterestController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.ideaInterestView = "accountId createTime ideaId";
    this.ideaInterestPopIdeaView =
      "popIdea.accountId popIdea.createTime  popIdea._id popIdea.title";
    this.interestnerPopView = "popUser.name popUser._id";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get(
      "/getInterest",
      [this.authority.checkLogin],
      this.getInterest
    );
    this.router.get("/getIdeaInterester", this.getIdeaInterester);
    this.router.post(
      "/operationInterest",
      [this.authority.checkLogin],
      this.operationInterest
    );
  };

  getInterest = async (req, res) => {
    const { page, pageSize } = req.query;
    const isValid = this.validator.validate(req.query, [
      {
        field: "page",
        type: "isInt"
      },
      {
        field: "pageSize",
        type: "isInt"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const { _id } = req.session.user;
    const result = await this.db
      .handlePage({
        Model: IdeaInterest,
        pagination: { page, pageSize },
        match: {
          accountId: this.db.ObjectId(_id)
        },
        sort: {
          createTime: -1
        },
        lookup: [
          {
            from: ModelNames.fuye.idea,
            localField: "ideaId",
            foreignField: "_id",
            as: "popIdea"
          },
          {
            from: ModelNames.fuye.ideaComment,
            localField: "ideaId",
            foreignField: "ideaId",
            as: "popIdeaComment"
          },
          {
            from: ModelNames.fuye.ideaInterest, // 注意这里自己lookup自己，是可以的
            localField: "ideaId",
            foreignField: "ideaId",
            as: "popIdeaInterest"
          }
        ],
        project: aggregate.project(
          `${this.ideaInterestView} ${this.ideaInterestPopIdeaView}`,
          {
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
            "popIdea.content": 1
          }
        ),
        map: item => {
          const popIdea = item.popIdea[0] || {};
          return {
            ...item,
            popIdea: {
              ...popIdea,
              content: undefined,
              brief: trimHtml(popIdea.content, {
                limit: 30,
                preserveTags: false,
                wordBreak: true
              }).html
            }
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

  getIdeaInterester = async (req, res) => {
    const { page, pageSize, ideaId } = req.query;
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
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await this.db
      .handlePage({
        Model: IdeaInterest,
        pagination: { page, pageSize },
        match: {
          ideaId: this.db.ObjectId(ideaId)
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
          }
        ],
        project: aggregate.project(
          `${this.ideaInterestView} ${this.interestnerPopView}`
        ),
        map: item => {
          return {
            ...item,
            popUser: item.popUser[0]
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

  operationInterest = async (req, res) => {
    const { ideaId, action } = req.body;
    const { _id } = req.session.user;
    const isValid = this.validator.validate(req.body, [
      {
        field: "action",
        type: "isIn",
        payload: ["add", "delete"]
      },
      {
        field: "ideaId",
        type: "isMongoId"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    let result;
    const findLimit = {
      ideaId,
      accountId: _id
    };
    if (action === "add") {
      result = await IdeaInterest.findOneAndUpdate(
        findLimit,
        { accountId: _id, ideaId, createTime: Date.now() },
        { new: true, upsert: true }
      ).catch(this.handleSqlError);
    } else if (action === "delete") {
      result = await IdeaInterest.findOneAndRemove(findLimit).catch(
        this.handleSqlError
      );
    }
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new IdeaInterestController().router;
