import { UserBlackList } from "../../models";
import { Router, Authority, Validator, Db } from "../../components";
import { ModelNames } from "../../constants";

class UserBlackListController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.validator = new Validator();
    this.db = new Db();
    this.router.get(
      "/getBlackUsers",
      [this.authority.checkAdmin],
      this.getBlackUsers
    );
    this.router.post(
      "/operationUserBlackList",
      [this.authority.checkLogin],
      this.operationUserBlackList
    );
  };

  getBlackUsers = async (req, res) => {
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

    const result = await this.db
      .handlePage({
        Model: UserBlackList,
        pagination: { page, pageSize },
        lookup: {
          from: ModelNames.user,
          localField: "accountId",
          foreignField: "_id",
          as: "popUser"
        },
        project: {
          "popUser.password": 0
        }
      })
      .catch(this.handleError);

    if (this.isError(result)) return this.fail(res);

    return this.success(res, {
      data: result.data.map(item => ({
        ...item,
        popUser: item.popUser[0]
      })),
      pagination: {
        page,
        pageSize,
        total: result.total
      }
    });
  };

  operationUserBlackList = async (req, res) => {
    const { accountId, type } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "type",
        type: "isIn",
        payload: ["normal", "inspecting", "forbidden"]
      },
      {
        field: "accountId",
        type: "isMongoId"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    let result;
    const findLimit = {
      accountId
    };
    if (type === "inspecting") {
      result = await UserBlackList.findOneAndUpdate(
        findLimit,
        { accountId, updateTime: Date.now(), $inc: { inspectTimes: 1 }, type },
        { new: true, upsert: true }
      ).catch(this.handleError);
    } else if (type === "forbidden") {
      result = await UserBlackList.findOneAndUpdate(
        findLimit,
        {
          accountId,
          updateTime: Date.now(),
          $inc: { forbiddenTimes: 1 },
          type
        },
        { new: true, upsert: true }
      ).catch(this.handleError);
    } else if (type === "normal") {
      result = await UserBlackList.findOneAndUpdate(
        findLimit,
        {
          accountId,
          updateTime: Date.now(),
          $inc: { normalTimes: 1 },
          type
        },
        { new: true }
      ).catch(this.handleError);
    }
    if (this.isError(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new UserBlackListController().router;
