import fetch from "node-fetch";
import { User } from "../../models";
import { Router, Authority } from "../../components";
import { splitQueryString, decryptString, RegExp } from "../../utils";
import _ from "lodash";
import { OAUTH } from "../../constants";

class UserController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.post("/login", this.login);
    this.router.post("/register", this.register);
    this.router.post("/loginThird", this.loginThird);
    this.router.get(
      "/getUserInfo",
      [this.authority.checkLogin],
      this.getUserInfo
    );
    this.router.get("/loginOut", this.loginOut);
    this.router.post(
      "/updateUserInfo",
      [this.authority.checkLogin],
      this.updateUserInfo
    );
    // this.router.post("/oauth/access_token", this.oauthAccess_token);
  };

  sendUser = (req, res, user) => {
    return this.success(res, {
      data: {
        accountId: user.accountId,
        name: user.name,
        ...(user.phone ? { phone: user.phone } : {}),
        ...(user.email ? { email: user.email } : {}),
        ...(user.member ? { member: user.member } : {})
      }
    });
  };

  login = async (req, res) => {
    const { accountId, password, ...rest } = req.body;
    if (!this.checkAccountIdAndPasswordFormat(accountId, password)) {
      return this.fail(res, {
        msg: "Bad Request",
        status: 400
      });
    }
    const user = { accountId, password, ...rest };
    return this.loginOrRegisterMode(req, res, user, "login");
  };

  register = async (req, res) => {
    const { accountId, password, ...rest } = req.body;
    if (!this.checkAccountIdAndPasswordFormat(accountId, password)) {
      return this.fail(res, {
        msg: "Bad Request",
        status: 400
      });
    }
    const user = { accountId, password, ...rest };
    return this.loginOrRegisterMode(req, res, user, "register");
  };

  loginThird = async (req, res) => {
    const { platform, ...rest } = req.body;
    if (platform === "WechatApplet") {
      // 微信小程序
      const { code } = rest;
      console.log(code);
    }
  };

  getUserInfo = async (req, res) => {
    const user = req.session.user;
    const findUser = await User.findOne({ accountId: user.accountId }).catch(
      this.handleSqlError
    );
    if (!findUser) {
      return this.fail(res, {
        msg: "账户不存在",
        status: 404
      });
    }
    return this.sendUser(req, res, findUser);
  };

  updateUserInfo = async (req, res) => {
    const user = req.session.user;
    const { phone, email } = req.body;
    if (
      (!phone && !email) ||
      (phone && !RegExp.phone.test(phone)) ||
      (email && !RegExp.email.test(email))
    ) {
      return this.fail(res, {
        msg: "Bad Request",
        status: 400
      });
    }
    const updatedUser = await User.findOneAndUpdate(
      {
        accountId: user.accountId
      },
      {
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {})
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!updatedUser) {
      return this.fail(res);
    }
    req.session.user = updatedUser;
    return this.sendUser(req, res, updatedUser);
  };

  loginOrRegisterMode = async (req, res, user, mode) => {
    let resultUser = null;
    const { accountId, password } = user;
    const findUser = await this.checkUserAccountIdIsExist(accountId);
    if (mode === "login") {
      if (!findUser) {
        return this.fail(res, {
          msg: "账户不存在"
        });
      }
      if (decryptString(password) !== decryptString(findUser.password)) {
        return this.fail(res, {
          msg: "密码错误"
        });
      }
      resultUser = findUser;
    } else {
      const { host, userAgent } = user;
      if (!host || !userAgent) {
        return this.fail(res, {
          msg: "Bad Request",
          status: 400
        });
      }
      const createUser = async (payload = {}) => {
        const { name = accountId } = payload;
        const newUser = new User({
          accountId, // accountId必须存在，password在第三方登陆或小程序登陆不需要
          name,
          host,
          userAgent,
          ...payload,
          decrypt: req.decrypt,
          createTime: Date.now()
        });
        return await newUser.save().catch(this.handleSqlError);
      };
      if (mode === "register") {
        if (findUser) {
          return this.fail(res, {
            msg: "账户名已经存在"
          });
        }
        const isDecryptExist = await this.checkDecryptIsExist(req.decrypt);
        if (isDecryptExist) {
          return this.fail(res, {
            msg: "Bad Request",
            status: 400
          });
        }
        resultUser = await createUser({
          password //正常注册，密码必须有
        });
      } else if (mode === "ifNotRegisterThenLogin") {
        // 第三方快捷登陆，微信小程序登陆
        if (!findUser) {
          resultUser = await createUser(); // 不需要密码，不需要
        } else {
          resultUser = findUser;
        }
      }
      if (!resultUser)
        return this.fail(res, {
          msg: "账户创建失败"
        });
    }
    req.session.user = resultUser;
    return this.sendUser(req, res, resultUser);
  };

  checkUserAccountIdIsExist = async accountId => {
    return await User.findOne({ accountId }).catch(this.handleSqlError);
  };

  checkDecryptIsExist = async decrypt => {
    return await User.findOne({ decrypt }).catch(this.handleSqlError);
  };

  checkAccountIdAndPasswordFormat = (accountId, password) => {
    password = decryptString(password);
    if (!(accountId && password)) return false;
    if (accountId.length > 20) return false;
    return !(password.length < 6 || password.length > 20);
  };

  loginOut = async (req, res) => {
    req.session.user = null;
    return this.success(res);
  };

  oauthAccess_token = async (req, res) => {
    const { platform, code } = req.body;
    if (!(platform && code)) {
      return this.fail(res, {
        status: 400,
        msg: "Bad Request"
      });
    }
    let user = {};
    if (platform === "github") {
      const text = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          client_id: OAUTH.github.client_id,
          client_secret: OAUTH.github.client_secret
        })
      })
        .then(res => res.text())
        .catch(() => null);

      const tokenResult = splitQueryString(text);
      if (tokenResult.error)
        return this.fail(res, { msg: tokenResult.error_description });
      if (!tokenResult.access_token)
        return this.fail(res, { msg: "获取access_token失败" });
      const userInfo = await fetch(
        `https://api.github.com/user?access_token=${tokenResult.access_token}`
      )
        .then(res => res.json())
        .catch(() => null);
      if (!_.get(userInfo, "id"))
        return this.fail(res, { msg: "获取用户信息失败" });
      user = {
        accountId: userInfo.id,
        name: `${userInfo.login}_${userInfo.id}`,
        platform: "github"
      };
    }
    return this.loginOrRegisterMode(req, res, user, "ifNotRegisterThenLogin");
  };
}

export default new UserController().router;
