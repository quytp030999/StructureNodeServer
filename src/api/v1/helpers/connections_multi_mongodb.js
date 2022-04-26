const mongoose = require("mongoose");

var connections = (uri) => {
  const conn = mongoose.createConnection(uri);

  conn.on("connected", () => {
    console.log(`MongoDb Connected ::: ${uri}`);
  });

  conn.on("disconnected", () => {
    console.log(`MongoDb Disconnected ::: ${uri}`);
  });

  conn.on("error", (err) => {
    console.log(`MongoDb Connect Error ::: ${JSON.stringify(error)}`);
  });

  process.on("SIGINT", async () => {
    await conn.close();
    process.exit(0);
  });

  return conn;
};

const MongoDbTutorial = connections(process.env.URI_MongoDB_MongooseTutorial);

module.exports = {
  MongoDbTutorial: MongoDbTutorial,
};
