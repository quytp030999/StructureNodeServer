const createError = require("http-errors");
const {
  userRegisterValidation,
  userGetListValidation,
} = require("../validations/user.validation");
const { validationString } = require("../services/util_serivces");
const User = require("../models/user.model");
const logger = require("../helpers/logger_events");
const redisClient = require("../helpers/connections_multi_redis");
const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../services/jwt_services");

var registerUser = async (req, res, next) => {
  const { error } = userRegisterValidation(req.body);
  if (error) {
    throw createError.BadRequest(error.details[0].message);
  }

  const { username, password } = req.body;

  const isExist = await User.findOne({ username: username });
  if (isExist) {
    throw createError.Conflict(`${username} is already exist`);
  }

  const user = new User({
    username: username,
    password: password,
  });

  const saveUser = await user.save();

  logger.info(`${req.url} ----- ${req.method} ----- Success`);

  res.json({
    status: "Success",
    user: saveUser,
  });
};

var loginUser = async (req, res, next) => {
  const { error } = userRegisterValidation(req.body);
  if (error) {
    throw createError.BadRequest(error.details[0].message);
  }

  const { username, password } = req.body;

  const user = await User.findOne({ username: username });
  if (!user) {
    throw createError.NotFound(`${username} Not Found`);
  }

  var isValidPassword = await user.isCheckPassword(password);
  if (!isValidPassword) {
    throw createError.Unauthorized(`Password Not Correct`);
  }

  const accessToken = await signAccessToken(user._id);
  const refreshToken = await signRefreshToken(user._id);

  logger.info(`${req.url} ----- ${req.method} ----- Success`);

  res.json({
    status: "Success",
    refreshToken: refreshToken,
    accessToken: accessToken,
    user: user,
  });
};

var getListUser = async (req, res, next) => {
  const { error } = userGetListValidation(req.body);
  if (error) {
    throw createError.BadRequest(error.details[0].message);
  }

  const { page, offset, search } = req.body;

  var query = {};

  if (validationString(search) == true) {
    query["username"] = new RegExp(search);
  }

  const users = await User.find(query, { _id: 0, __v: 0, password: 0 })
    .skip((page - 1) * offset)
    .limit(offset);
  const count = await User.countDocuments(query);

  logger.info(`${req.url} ----- ${req.method} ----- Success`);

  res.json({
    status: "Success",
    data: users,
    total: count,
  });
};

var logOut = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError.BadRequest();
  }

  const { userId } = await verifyRefreshToken(refreshToken);

  redisClient
    .del(userId.toString())
    .then(() => {

      logger.info(`${req.url} ----- ${req.method} ----- Success`);

      res.json({
        message: "LogOut",
      });
    })
    .catch((err) => {
      throw createError.InternalServerError();
    });
};

module.exports = {
  registerUser: registerUser,
  loginUser: loginUser,
  getListUser: getListUser,
  logOut: logOut,
};
