import { Router, Authority, Validator, Env, Db } from "../../../components";
import { AnswerDb } from "../../../models";
import { Domain } from "../../../constants";

class AnswerDbController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.answerDbView = "createTime intro member name desc title online";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get("/getAnswerDbs", this.getAnswerDbs);
    this.router.post(
      "/onlineAnswerDb",
      [this.authority.checkAdmin],
      this.onlineAnswerDb
    );
    this.router.put(
      "/offlineAnswerDb",
      [this.authority.checkAdmin],
      this.offlineAnswerDb
    );
    this.router.delete(
      "/deleteLineDb",
      [this.authority.checkAdmin],
      this.deleteLineDb
    );
    this.router.put(
      "/updateLineDb",
      [this.authority.checkAdmin],
      this.updateLineDb
    );
  };

  getAnswerDbs = async (req, res) => {
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
    if (!isValid) return this.fail(res, { status: 400 });
    const result = await this.db
      .handlePage({
        Model: AnswerDb,
        pagination: { page, pageSize },
        match: {
          ...(online ? { online } : {})
        },
        project: this.answerDbView
      })
      .catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result.data.concat({
        _id: Date.now(),
        name: "all.json",
        title: "all",
        member: {
          limit: 1,
          price: Domain.fuye.memberAllPrice
        }
      }),
      pagination: {
        page,
        pageSize,
        total: result.total
      }
    });
  };

  onlineAnswerDb = async (req, res) => {
    const { name, desc, title, intro, member } = req.body;
    if (!name || !desc || !title || !intro || !member)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name },
      {
        name,
        desc,
        title,
        intro,
        member,
        createTime: Date.now(),
        online: "on"
      },
      { new: true, upsert: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  offlineAnswerDb = async (req, res) => {
    const { name } = req.body;
    if (!name)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name },
      {
        online: "off"
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  deleteLineDb = async (req, res) => {
    const { name } = req.body;
    if (!name)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndRemove(
      { name },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  updateLineDb = async (req, res) => {
    const { name, desc, title, intro, member } = req.body;
    if (!name || !desc || !title || !intro || !member)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name },
      {
        name,
        desc,
        title,
        intro,
        member
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerDbController().router;
