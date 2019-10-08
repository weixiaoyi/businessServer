import nodemailer from "nodemailer";

class Mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "smtp.163.com",
      host: "smtp.163.com",
      port: 465, // SMTP 端口
      secureConnection: true, // 使用了 SSL
      auth: {
        user: "l000fuye@163.com", // 注意开头是小写字母l,不是数字1
        pass: "weixiaoyi886" // 这是授权码，密码weixiaoyao886
      }
    });
  }
  send = () => {
    return this.transporter.sendMail({
      from: "l000fuye@163.com",
      to: "l000fuye@163.com",
      subject: "标题：这是一封来自Nodejs发送的邮件",
      text: "你好吗",
      html: "<b>北京欢迎你</b>"
    });
  };
}

export default new Mail();
