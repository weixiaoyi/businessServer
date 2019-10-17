import { Router, Authority, Db, Validator, Env } from "../../../components";
import { Group } from "../../../models";

class GroupController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get("/getGroups", this.getGroups);
    this.router.post("/addGroup", [this.authority.checkAdmin], this.addGroup);
    this.router.put(
      "/updateGroup",
      [this.authority.checkAdmin],
      this.updateGroup
    );
    this.router.delete(
      "/deleteGroup",
      [this.authority.checkAdmin],
      this.deleteGroup
    );
  };

  getGroups = async (req, res) => {
    const result = await Group.find().catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  addGroup = async (req, res) => {
    const { index, type, title, desc, avatar } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "index",
        type: "required"
      },
      {
        field: "type",
        type: "required"
      },
      {
        field: "title",
        type: "required"
      },
      {
        field: "desc",
        type: "required"
      },
      {
        field: "avatar",
        type: "required"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const result = await Group.findOneAndUpdate(
      { type, title },
      { index, type, title, desc, avatar, createTime: Date.now() },
      { new: true, upsert: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  updateGroup = async (req, res) => {
    const { id, index, type, title, desc, avatar } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "index",
        type: "required"
      },
      {
        field: "id",
        type: "isMongoId"
      },
      {
        field: "type",
        type: "required"
      },
      {
        field: "title",
        type: "required"
      },
      {
        field: "desc",
        type: "required"
      },
      {
        field: "avatar",
        type: "required"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const result = await Group.findByIdAndUpdate(
      id,
      { index, type, title, desc, avatar, updateTime: Date.now() },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  deleteGroup = async (req, res) => {
    const { id } = req.body;
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

    const result = await Group.findByIdAndRemove(id, { new: true }).catch(
      this.handleError
    );
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new GroupController().router;
