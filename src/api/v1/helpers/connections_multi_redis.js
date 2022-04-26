const redis = require("redis");

const client = redis.createClient();

client
  .connect()
  .then(() => {
    console.log("Redis PONG");
  })
  .catch((error) => {
    console.log("error", error);
  });

client.on("error", function (error) {
  console.log("error", error);
});

client.on("connect", function () {
  console.log("Redis connected");
});

client.on("ready", function () {
  console.log("Redis ready");
});

module.exports = client;
