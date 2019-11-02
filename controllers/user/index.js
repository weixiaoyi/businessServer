import fetch from "node-fetch";
import { User, Member } from "../../models";
import { Router, Authority, Validator, Db } from "../../components";
import { splitQueryString, decryptString, RegExp } from "../../utils";
import _ from "lodash";
import { OAUTH, Domain, ModelNames, SetReqSession } from "../../constants";

class UserController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.validator = new Validator();
    this.db = new Db();
    this.router.post("/login", this.login);
    this.router.post("/register", this.register);
    this.router.post("/loginThird", this.loginThird);
    this.router.get(
      "/getUserInfo",
      [this.authority.checkLogin],
      this.getUserInfo
    );
    this.router.get(
      "/getUserMemberInfo",
      [this.authority.checkLogin],
      this.getUserMemberInfo
    );
    this.router.get("/getUsers", [this.authority.checkAdmin], this.getUsers);
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
        accountId: user._id,
        name: user.name,
        ...(user.phone ? { phone: user.phone } : {}),
        ...(user.email ? { email: user.email } : {})
      }
    });
  };

  setSessionUser = user => {
    return {
      _id: user._id
    };
  };

  getUserInfo = async (req, res) => {
    const user = req.session.user;
    const findUser = await User.findById(user._id).catch(this.handleError);
    if (this.isError(findUser)) return this.fail(res);
    if (this.isNull(findUser)) {
      return this.fail(res, {
        msg: "账户不存在",
        status: 404
      });
    }
    return this.sendUser(req, res, findUser);
  };

  getUserMemberInfo = async (req, res) => {
    const { _id } = req.session.user;
    const findMember = await Member.findOne({ accountId: _id }).catch(
      this.handleError
    );
    if (this.isError(findMember)) return this.fail(res);
    return this.success(res, { data: findMember });
  };

  getUsers = async (req, res) => {
    const { page, pageSize, id, name } = req.query;
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
        field: "domain",
        type: "isIn",
        payload: [Domain.fuye.value]
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const result = await this.db
      .handlePage({
        Model: User,
        pagination: { page, pageSize },
        match: {
          domain: Domain.fuye.value,
          ...(id ? { _id: this.db.ObjectId(id) } : {}),
          ...(name ? { name } : {})
        },
        lookup: {
          from: ModelNames.userBlackList,
          localField: "_id",
          foreignField: "accountId",
          as: "popUserBlackList"
        },
        project: {
          password: 0
        }
      })
      .catch(this.handleError);

    if (this.isError(result) || this.isNull(result)) return this.fail(res);

    return this.success(res, {
      data: result.data.map(item => ({
        ...item,
        popUserBlackList: item.popUserBlackList[0]
      })),
      pagination: {
        page,
        pageSize,
        total: result.total
      },
      requiredInfo: {}
    });
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
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {})
      },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(updatedUser) || this.isNull(updatedUser)) {
      return this.fail(res);
    }
    SetReqSession(req, "user", this.setSessionUser(updatedUser));
    return this.sendUser(req, res, updatedUser);
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
    const { domain, name, password, userAgent, captcha } = req.body;
    if (!this.checkNameAndPasswordFormat(domain, name, password)) {
      return this.fail(res, {
        msg: "Bad Request",
        status: 400
      });
    }
    const user = { domain, name, password, userAgent, captcha };
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

  loginOrRegisterMode = async (req, res, user, mode) => {
    let resultUser = null;
    const { domain, name, password } = user;
    const findUser = await this.checkDomainUserNameIsExist(domain, name).catch(
      this.handleError
    );
    if (this.isError(findUser)) return this.fail(res);
    if (mode === "login") {
      if (this.isNull(findUser)) {
        return this.fail(res, {
          status: 404,
          msg: "账户不存在"
        });
      }
      if (decryptString(password) !== decryptString(findUser.password)) {
        return this.fail(res, {
          msg: "密码错误"
        });
      }
      const updateLoginTime = User.findOneAndUpdate(
        {
          domain,
          name
        },
        { lastLoginTime: Date.now() },
        { new: true }
      ).catch(this.handleError);
      if (this.isError(updateLoginTime) || this.isNull(updateLoginTime))
        return this.fail(res);
      resultUser = findUser;
    } else {
      const { userAgent, captcha } = user;
      if (!userAgent) {
        return this.fail(res, {
          msg: "Bad Request",
          status: 400
        });
      }
      if (
        !captcha ||
        !req.session.captcha ||
        captcha.toUpperCase() !== req.session.captcha.toUpperCase()
      ) {
        return this.fail(res, {
          msg: "验证码错误，请填写正确验证码",
          status: 400
        });
      }
      const createUser = async () => {
        const timeNow = Date.now();
        const newUser = new User({
          name,
          password,
          domain,
          userAgent,
          decrypt: req.decrypt,
          createTime: timeNow
        });
        return newUser.save();
      };
      if (mode === "register") {
        if (findUser) {
          return this.fail(res, {
            msg: "账户名已经存在"
          });
        }
        resultUser = await createUser().catch(this.handleError);
        if (this.isError(resultUser)) return this.fail(res);
      } else if (mode === "ifNotRegisterThenLogin") {
        // resultUser = findUser;
      }
      if (this.isNull(resultUser))
        return this.fail(res, {
          msg: "账户创建失败"
        });
    }
    SetReqSession(req, "user", this.setSessionUser(resultUser));
    return this.sendUser(req, res, resultUser);
  };

  checkDomainUserNameIsExist = async (domain, name) =>
    User.findOne({ domain, name });

  checkNameAndPasswordFormat = (domain, name, password) => {
    const isValid = this.validator.validate(undefined, [
      {
        value: domain,
        type: "isIn",
        payload: [Domain.fuye.value]
      },
      {
        value: name,
        transform: String,
        type: "isLength",
        payload: {
          min: undefined,
          max: 20
        }
      },
      {
        value: password,
        type: "required"
      }
    ]);
    if (!isValid) return false;
    password = decryptString(password);
    return !(password.length < 6 || password.length > 25);
  };

  loginOut = async (req, res) => {
    SetReqSession(req, "user", null);
    req.session.destroy();
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
        name: `${userInfo.login}_${userInfo.id}`,
        platform: "github"
      };
    }
    return this.loginOrRegisterMode(req, res, user, "ifNotRegisterThenLogin");
  };
}

export default new UserController().router;
