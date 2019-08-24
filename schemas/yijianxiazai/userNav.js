import mongoose from "mongoose";
const userNavSchema = new mongoose.Schema({
  accountId: String,
  navs: [
    {
      desc: String,
      address: String,
      id: String,
      introduce: String,
      createTime: Date
    }
  ]
});
export default userNavSchema;
