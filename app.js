require("@babel/register");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const controllers = require("./controllers");
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  bufferMaxEntries: 0,
  poolSize: 10,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  family: 4
});
mongoose.set("useCreateIndex", true); //加上这个
mongoose.set("useFindAndModify", false);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "数据库链接失败"));
db.once("open", () => {
  console.warn.bind(console, "数据库链接成功");
});

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  methodOverride(req => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
app.use(
  session({
    secret: process.env.MONGODB_SECRET,
    store: new MongoStore({
      mongooseConnection: db,
      ttl: 60 * 60
    }),
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

controllers(app);

module.exports = app;
