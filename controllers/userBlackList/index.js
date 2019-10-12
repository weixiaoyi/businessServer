import { UserBlackList } from "../../models";
import { Router, Authority, Validator } from "../../components";

class UserBlackListController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.validator = new Validator();
    this.router.post(
      "/operationUserBlackList",
      [this.authority.checkLogin],
      this.operationUserBlackList
    );
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
      ).catch(this.handleSqlError);
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
      ).catch(this.handleSqlError);
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
      ).catch(this.handleSqlError);
    }
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new UserBlackListController().router;
