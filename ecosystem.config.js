module.exports = {
  apps: [
    {
      name: "server",
      script: "./bin/www",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        PORT: 7001,
        NODE_ENV: "development",
        // MONGODB_URL: "mongodb://47.104.71.141/27017",
        MONGODB_URL: "mongodb://admin:weixiaoyao886@47.104.71.141:27017/admin",
        MONGODB_SECRET: "weixiaoyi"
      },
      env_production: {
        PORT: 7001,
        NODE_ENV: "production",
        MONGODB_SECRET: "weixiaoyi",
        MONGODB_URL: "mongodb://admin:weixiaoyao886@47.104.71.141:27017/admin"
      }
    }
  ]
};
