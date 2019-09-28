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
        ...(user.email ? { email: user.email } : {})
      }
    });
  };

  login = async (req, res) => {
    const { domain, name, password, ...rest } = req.body;
    if (!this.checkNameAndPasswordFormat(domain, name, password)) {
      return this.fail(res, {
        msg: "Bad Request",
        status: 400
      });
    }
    const user = { domain, name, password, ...rest };
    return this.loginOrRegisterMode(req, res, user, "login");
  };

  register = async (req, res) => {
    const { domain, name, password, ...rest } = req.body;
    if (!this.checkNameAndPasswordFormat(domain, name, password)) {
      return this.fail(res, {
        msg: "Bad Request",
        status: 400
      });
    }
    const user = { domain, name, password, ...rest };
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
    const { domain, name, password } = user;
    const findUser = await this.checkDomainUserNameIsExist(domain, name);
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
      const { userAgent } = user;
      if (!userAgent) {
        return this.fail(res, {
          msg: "Bad Request",
          status: 400
        });
      }
      const createUser = async () => {
        const timeNow = Date.now();
        const newUser = new User({
          accountId: timeNow,
          name,
          password,
          domain,
          userAgent,
          decrypt: req.decrypt,
          createTime: timeNow
        });
        return await newUser.save().catch(this.handleSqlError);
      };
      if (mode === "register") {
        if (findUser) {
          return this.fail(res, {
            msg: "账户名已经存在"
          });
        }

        const isDecryptExist = await this.checkDecryptIsExist(
          req.decrypt
        ).catch(this.handleSqlError);
        if (isDecryptExist) {
          return this.fail(res, {
            msg: "Bad Request",
            status: 400
          });
        }
        resultUser = await createUser();
      } else if (mode === "ifNotRegisterThenLogin") {
        // resultUser = findUser;
      }
      if (!resultUser)
        return this.fail(res, {
          msg: "账户创建失败"
        });
    }
    req.session.user = resultUser;
    return this.sendUser(req, res, resultUser);
  };

  checkDomainUserNameIsExist = async (domain, name) => {
    return await User.findOne({ domain, name }).catch(this.handleSqlError);
  };

  checkDecryptIsExist = async decrypt => {
    return await User.findOne({ decrypt }).catch(this.handleSqlError);
  };

  checkNameAndPasswordFormat = (domain, name, password) => {
    if (!(domain && name && password)) return false;
    password = decryptString(password);
    if (name.length > 20) return false;
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
