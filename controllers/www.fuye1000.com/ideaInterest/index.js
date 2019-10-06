import { Router, Authority, Db, Validator, Env } from "../../../components";
import { IdeaInterest } from "../../../models";
import { ModelNames } from "../../../constants";
import { aggregate, trimHtml } from "../../../utils";

class IdeaInterestController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.ideaInterestView = "accountId createTime ideaId popIdea";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get("/getInterest", this.getInterest);
    this.router.post(
      "/addInterest",
      [this.authority.checkLogin],
      this.addInterest
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
            from: ModelNames.idea,
            localField: "ideaId",
            foreignField: "_id",
            as: "popIdea"
          },
          {
            from: ModelNames.ideaComment,
            localField: "ideaId",
            foreignField: "ideaId",
            as: "popIdeaComment"
          },
          {
            from: ModelNames.ideaInterest, // 注意这里自己lookup自己，是可以的
            localField: "ideaId",
            foreignField: "ideaId",
            as: "popIdeaInterest"
          }
        ],
        project: aggregate.project(this.ideaInterestView, {
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
          }
        }),
        map: item => {
          return {
            ...item
            // brief: trimHtml(item.content, {
            //   limit: 30,
            //   preserveTags: false,
            //   wordBreak: true
            // }).html
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

  addInterest = async (req, res) => {
    const { id } = req.body;
    const { _id } = req.session.user;
    const isValid = this.validator.validate(req.body, [
      {
        field: "id",
        type: "isMongoId"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const newInterest = new IdeaInterest({
      accountId: _id,
      ideaId: id,
      createTime: Date.now()
    });
    const result = await newInterest.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new IdeaInterestController().router;
