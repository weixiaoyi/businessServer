import { Router, Authority } from "../../../components";
import { AnswerDb } from "../../../models";

class AnswerDbController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get(
      "/getAnswerDbs",
      [this.authority.checkLogin],
      this.getAnswerDbs
    );
    this.router.post(
      "/onlineAnswerDb",
      [this.authority.checkLogin],
      this.onlineAnswerDb
    );
    this.router.post(
      "/offlineAnswerDb",
      [this.authority.checkLogin],
      this.offlineAnswerDb
    );
    this.router.post(
      "/deleteLineDb",
      [this.authority.checkLogin],
      this.deleteLineDb
    );
    this.router.post(
      "/updateLineDb",
      [this.authority.checkLogin],
      this.updateLineDb
    );
  };

  getAnswerDbs = async (req, res) => {
    const { page, pageSize, online } = req.query;
    const counts = await AnswerDb.countDocuments().catch(this.handleSqlError);
    if (!page || !pageSize) return this.fail(res, { status: 400 });
    const data = await AnswerDb.find(online ? { online } : {})
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: counts
      }
    });
  };

  onlineAnswerDb = async (req, res) => {
    const db = req.body;
    if (!db || !db.name || !db.title || !db.intro || !db.member)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name: db.name },
      {
        ...db,
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
    const db = req.body;
    if (!db || !db.name || !db.title || !db.intro || !db.member)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name: db.name },
      {
        ...db
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
