import { Router, Authority } from "../../../components";
import { UserNav } from "../../../models";

class UserRecordController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get(
      "/getUserNav",
      [this.authority.checkLogin],
      this.getUserNav
    );

    this.router.post(
      "/updateUserNav",
      [this.authority.checkLogin],
      this.updateUserNav
    );
  };

  getUserNav = async (req, res) => {
    const { user } = req.session;
    const result = await UserNav.findOne({ accountId: user.accountId }).catch(
      this.handleSqlError
    );
    if (!result) {
      return this.success(res, {
        data: []
      });
    }
    return this.success(res, {
      data: this.formatUserNav(result.navs)
    });
  };

  updateUserNav = async (req, res) => {
    const { user } = req.session;
    const { action, ...rest } = req.body;
    let result;
    if (action === "add") {
      const { desc, address } = rest;
      result = await UserNav.findOneAndUpdate(
        { accountId: user.accountId },
        {
          $push: { navs: { desc, address, id: Date.now() } }
        },
        { new: true, upsert: true }
      ).catch(this.handleSqlError);
    } else if (action === "update") {
      const { id, desc, address } = rest;
      result = await UserNav.findOneAndUpdate(
        { accountId: user.accountId, "navs.id": id },
        {
          $set: { "navs.$": { desc, address, id } }
        },
        { new: true }
      ).catch(this.handleSqlError);
    } else if (action === "move") {
      const { newIndex, oldIndex } = rest;
      const findOne = await UserNav.findOne({
        accountId: user.accountId
      }).catch(this.handleSqlError);
      if (findOne) {
        const navs = findOne.navs;
        const oldOne = navs.splice(oldIndex, 1)[0];
        navs.splice(newIndex, 0, oldOne);
        result = await UserNav.findOneAndUpdate(
          { accountId: user.accountId },
          {
            navs
          },
          { new: true }
        ).catch(this.handleSqlError);
      }
    } else if (action === "delete") {
      const { id } = rest;
      result = await UserNav.findOneAndUpdate(
        { accountId: user.accountId },
        {
          $pull: { navs: { id } }
        },
        { new: true }
      ).catch(this.handleSqlError);
    }
    if (result && result.navs) {
      return this.success(res, {
        data: this.formatUserNav(result.navs)
      });
    }
    return this.fail(res);
  };

  formatUserNav = navs => {
    return navs.map(({ desc, address, id }) => ({
      desc,
      address,
      id
    }));
  };
}

export default new UserRecordController().router;
