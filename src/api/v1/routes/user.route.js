const express = require("express");
const handleError = require("../helpers/handle.error");
const { verifyAccessToken } = require("../services/jwt_services");
const route = express.Router();

const {
  registerUser,
  loginUser,
  getListUser,
  logOut,
} = require("../controllers/user.controller");

route.post("/register", handleError(registerUser));

route.post("/refresh-token", (req, res, next) => {
  res.send("refresh-token");
});

route.post("/login", handleError(loginUser));

route.delete("/logout", handleError(logOut));

route.post("/list", verifyAccessToken, handleError(getListUser));

module.exports = route;
