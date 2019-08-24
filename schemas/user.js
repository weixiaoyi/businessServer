import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  accountId: String,
  platform: String, //第三方账号平台
  userAgent: String, // pc,apple,linux,微信小程序，app
  name: String,
  password: String,
  host: String, // yijianxiazai.com
  phone: String,
  email: String,
  age: Number,
  sex: Number,
  avatar: String,
  address: String,
  safeLevel: String, // 安全等级
  safeLevelDetail: {
    issues: String
  },
  createTime: Date,
  updateTime: Date,
  decrypt: String,
  member: Boolean, // 会员
  memberDetail: {
    memberLevel: String, // 会员等级
    startTime: Date,
    endTime: Date,
    referenceAccount: String, // 推荐人
    referenceOrder: String // 关联订单
  },
  identify: String, // 站长，管理员，代理
  identifyDetail: {
    startTime: Date,
    introduce: String
  },
  other: String
});
export default userSchema;
