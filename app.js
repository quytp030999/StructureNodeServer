const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const morgan = require("morgan");
const createError = require("http-errors");
const logger = require("./src/api/v1/helpers/logger_events");
const userRoute = require("./src/api/v1/routes/user.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // block headers
app.use(morgan("common")); // Standard Apache common log output. :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length]

app.use("/v1/users", userRoute);

/*
    Nhận Api không tồn tại và trả về Client
*/
app.use((req, res, next) => {
  logger.info(`${req.url} ----- ${req.method} ----- Api Not Found`);
  next(
    createError(404, {
      message: "Not Found",
    })
  );
});

/*
    Nhận throw Error và trả về Client
*/
app.use((err, req, res, next) => {
  logger.info(`${req.url} ----- ${req.method} ----- ${err.message || ""}`);
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

module.exports = app;
