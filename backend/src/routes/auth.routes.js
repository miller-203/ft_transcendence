const express = require("express");
const authRouter = express.Router();
const {
    register,
    login,
    logout,
} = require("../controllers/auth.controller");
const { validateRegister } = require("../validate/validateRegistration");
const {validateLogin} = require("../validate/validateLogin");
const {loginLimiter} = require("../middlewares/loginLimiter");

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.post("/logout", logout);

module.exports = authRouter;
