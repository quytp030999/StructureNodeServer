const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const redisClient = require("../helpers/connections_multi_redis");

const signAccessToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId: userId,
    };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const option = {
      expiresIn: "10m",
    };
    JWT.sign(payload, secret, option, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw createError.Unauthorized();
  }

  const bearerToken = authorization.split(" ")[1];
  const secret = process.env.ACCESS_TOKEN_SECRET;

  JWT.verify(bearerToken, secret, (err, payload) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return next(createError.Unauthorized());
      }
      return next(createError.Unauthorized(err.message));
    }
    req.payload = payload;
    next();
  });
};

const signRefreshToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId: userId,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const option = {
      expiresIn: "1y",
    };
    JWT.sign(payload, secret, option, (err, token) => {
      if (err) {
        reject(err);
      } else {
        redisClient
          .set(userId.toString(), token, {
            EX: 365 * 24 * 60 * 60,
          })
          .then(() => {
            resolve(token);
          })
          .catch((err) => {
            return reject(createError.InternalServerError());
          });
      }
    });
  });
};

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          reject(err);
        } else {
          redisClient
            .get(payload.userId)
            .then((result) => {
              if (refreshToken === result) {
                return resolve(payload);
              } else {
                return reject(createError.Unauthorized());
              }
            })
            .catch((err) => {
              return reject(createError.InternalServerError());
            });
        }
      }
    );
  });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
