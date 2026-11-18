const express = require("express");
const authRouter = express.Router();
const {
    register,
    login,
    logout,
} = require("../controllers/auth.controller");
const { validateRegister } = require("../middlewares/validateRegistration");
const {validateLogin} = require("../middlewares/validateLogin");
const {loginLimiter} = require("../middlewares/loginLimiter");

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", loginLimiter, validateLogin, login);
authRouter.post("/logout", logout);

module.exports = authRouter;
