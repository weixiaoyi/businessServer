module.exports = {
  apps: [
    {
      name: "server",
      script: "./bin/www",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env_local: {
        PORT: 7001,
        NODE_ENV: "development",
        MONGODB_URL: "mongodb://localhost:27017/admin",
        MONGODB_SECRET: "weixiaoyi"
      },
      env_development: {
        PORT: 7001,
        NODE_ENV: "development",
        MONGODB_URL: "mongodb://dev:weixiaoyao886@47.104.71.141:27017/dev",
        MONGODB_SECRET: "weixiaoyi"
      },
      env_production: {
        PORT: 7001,
        NODE_ENV: "production",
        MONGODB_SECRET: "weixiaoyi",
        MONGODB_URL: "mongodb://prod:weixiaoyao886@47.104.71.141:27017/prod"
      }
    }
  ]
};
