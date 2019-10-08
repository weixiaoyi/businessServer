import fetch from "node-fetch";
import { Router, Authority, Validator } from "../../components";
import { signature } from "./pay";
import { Member, AnswerDb } from "../../models";

class PayController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.validator = new Validator();
    this.router.get(
      "/getPayImageUrl",
      [this.authority.checkLogin],
      this.getPayImageUrl
    );
    this.router.post("/testNotify", this.testNotify);
    this.router.post("/notify", this.notify);
  };

  testNotify = async (req, res) => {
    /* const example = {
      attach: "183532689941",
      mchid: "1549111861",
      openid: "o7LFAwWfsCpvTdIQpsRJLhDq8OX8",
      out_trade_no: "no",
      payjs_order_id: "2019081816392400643632616",
      return_code: "1",
      time_end: "2019-08-18 16:39:34",
      total_fee: "1",
      transaction_id: "4200000357201908182662350239",
      sign: "213AC3BD467175689B3D40858E89C59D"
    };*/
    console.log(req.body, "----req.body");
    const { attach, ...rest } = req.body;
    const isValidAttach = this.validator.validate(req.body, [
      {
        field: "attach",
        type: "isJSON"
      }
    ]);
    if (!isValidAttach) return this.fail(res);
    const { accountId, field } = JSON.parse(attach);
    const isValidParseAttach = this.validator.validate(undefined, [
      {
        value: accountId,
        type: "isMongoId"
      },
      {
        value: field,
        type: "required"
      }
    ]);
    if (!isValidParseAttach) return this.fail(res);
    await Member.findOneAndUpdate(
      { accountId },
      {
        accountId,
        $set: {
          [`detail.${field}`]: {
            createTime: Date.now(),
            status: true,
            transaction_id: rest.transaction_id
          }
        }
      },
      { new: true, upsert: true }
    ).catch(this.handleSqlError);
    return this.success(res);
  };

  notify = async (req, res) => {
    /* const example = {
      attach: "183532689941",
      mchid: "1549111861",
      openid: "o7LFAwWfsCpvTdIQpsRJLhDq8OX8",
      out_trade_no: "no",
      payjs_order_id: "2019081816392400643632616",
      return_code: "1",
      time_end: "2019-08-18 16:39:34",
      total_fee: "1",
      transaction_id: "4200000357201908182662350239",
      sign: "213AC3BD467175689B3D40858E89C59D"
    };*/
    const { attach: accountId, ...rest } = req.body;
    await Member.findOneAndUpdate(
      { accountId },
      {
        member: true,
        $set: {
          "memberDetail.referenceOrder": rest.transaction_id,
          "memberDetail.startTime": Date.now()
        }
      },
      { new: true }
    ).catch(this.handleSqlError);
    return this.success(res);
  };

  getPayImageUrl = async (req, res) => {
    const { user } = req.session;
    const { domain } = user;
    let fee = "";
    let attach = "";
    let body = "会员 ";
    if (domain === "yijianxiazai.com") {
      fee = 2000;
    } else if (domain === "fuye") {
      const { dbName } = req.query;
      const isValid = this.validator.validate(req.query, [
        {
          field: "dbName",
          type: "required"
        }
      ]);
      if (!isValid) return this.fail(res);

      if (user.name === "18353268994" || user.name === "test") {
        body = "1000fuye.com 测试会员";
        fee = 1;
      } else if (dbName === "all") {
        body = "1000fuye.com 一站通会员";
        fee = 149 * 100;
      } else {
        body = "1000fuye.com 教程会员";
        const answerDbInfo = await AnswerDb.findOne({ name: dbName }).catch(
          this.handleSqlError
        );
        if (!answerDbInfo) return this.fail(res);
        fee = answerDbInfo.member.price * 100;
      }
      attach = JSON.stringify({
        accountId: user._id,
        field: dbName.replace(".json", "")
      });
    } else {
      return this.fail(res);
    }

    const params = {
      mchid: "1549111861",
      total_fee: fee,
      attach,
      body,
      out_trade_no: "no",
      notify_url: "https://www.1000fuye.com/api/pay/testNotify"
    };
    const signUrl = signature(params);
    const result = await fetch("https://payjs.cn/api/native", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signUrl)
    })
      .then(res => res.json())
      .catch(() => {
        return null;
      });
    if (result && result.sign) {
      return this.success(res, {
        data: {
          code_url: result.code_url,
          orderId: result.payjs_order_id,
          qrCode: result.qrcode
        }
      });
    }
    return this.fail(res);
  };
}

export default new PayController().router;
