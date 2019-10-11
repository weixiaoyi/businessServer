import { User, Member, IdeaInterest } from "../../models";
import { Router, Authority, Validator } from "../../components";
import _ from "lodash";

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
    const { accountId, type, why, action } = req.body;
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

export default new UserBlackListController().router;
