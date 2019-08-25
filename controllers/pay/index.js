import fetch from "node-fetch";
import { Router, Authority } from "../../components";
import { signature } from "./pay";
import { User } from "../../models";

class PayController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get(
      "/getPayImageUrl",
      [this.authority.checkLogin],
      this.getPayImageUrl
    );
    this.router.post("/notify", this.notify);
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
    await User.findOneAndUpdate(
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
    const { host } = user;
    let fee = "";
    if (user.accountId === "18353268994" || user.accountId === "test") {
      fee = 1;
    } else if (host === "yijianxiazai.com") {
      fee = 2000;
    } else {
      fee = 5000;
    }
    const params = {
      mchid: "1549111861",
      total_fee: fee,
      attach: user.accountId,
      body: "充值会员",
      out_trade_no: "no",
      notify_url: "https://www.yijianxiazai.com/api/pay/notify"
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
          orderId: result.payjs_order_id,
          qrCode: result.qrcode
        }
      });
    }
    return this.fail(res);
  };
}

export default new PayController().router;