const express = require("express");
const authRouter = express.Router();
const {
    register,
    login,
} = require("../controllers/auth.controller");
const { validateRegister } = require("../validators/validateRegistration");
const { validateLogin } = require("../validators/validateLogin");
const { loginLimiter, registerLimiter } = require("../middlewares/authRateLimiter");

authRouter.post("/register", registerLimiter, validateRegister, register);
authRouter.post("/login", loginLimiter, validateLogin, login);

module.exports = authRouter;
