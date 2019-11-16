import nodemailer from "nodemailer";

class Mail {
  constructor({ proxy }) {
    if (proxy === "163") {
      this.trans = {
        service: "smtp.163.com",
        host: "smtp.163.com",
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          user: "l000fuye@163.com", // 注意开头是小写字母l,不是数字1
          pass: "weixiaoyi886" // 这是授权码，密码weixiaoyao886
        }
      };
    } else if (proxy === "qq") {
      this.trans = {
        service: "smtp.qq.com",
        host: "smtp.qq.com",
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          user: "fuye.1000@qq.com", // 注意开头是小写字母l,不是数字1
          pass: "bcbbkidrvqwxecei" // 这是授权码，密码weixiaoyao886
        }
      };
    }
    this.transporter = nodemailer.createTransport(this.trans);
  }
  send = ({ from, to, title, text }) => {
    return this.transporter.sendMail({
      from: this.trans.auth.user,
      to: this.trans.auth.user,
      subject: title,
      text: text
      // html: "<b>北京欢迎你</b>"
    });
  };
}

export default new Mail({ proxy: "qq" });
