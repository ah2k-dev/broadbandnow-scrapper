const Redis = require("ioredis");

const redis = new Redis({
  port: 12804,
  host: "redis-12804.c244.us-east-1-2.ec2.redns.redis-cloud.com",
  password: "KNEW3vXJIM9ujVe88EoQsvW7HSxzizL6",
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (error) => {
  console.error(error);
});

module.exports = redis;