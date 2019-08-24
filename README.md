# business

### 项目 PORT

book.yijianxiazai.com: http://localhost:7000

admin: http://localhost:7003

nodeCase: http://localhost:7002

server: http://localhost:7001

所有个人商业项目

### mongodb 开启流程

安装 mongdb,默认安装到 C:\Program Files\MongoDB

需要在 c 盘新建 data/db 目录，再到 C:\Program Files\MongoDB\Server\4.0\bin 目录点击 mongod 启动数据库，mongod 是数据库程序，mongo 是数据库 shell,

浏览器查看http://127.0.0.1:27017/标志数据库启动了

### node 开启 babel 支持 es6,es7,import,类方法箭头函数需要的 babel 条件

安装插件
yarn add @babel/core @babel/register @babel/preset-env

yarn add @babel/plugin-proposal-decorators

yarn add @babel/plugin-proposal-class-properties

// app.js 为主入口文件
require('@babel/register')

修改.babelrc 中的 plugins

```json
"presets":[
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": true
        }
      }
    ]
  ],
"plugins":[
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }]
  ]
```
