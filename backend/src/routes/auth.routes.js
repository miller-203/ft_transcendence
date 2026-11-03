const express = require("express");
const authRouter = express.Router();
const {
    register,
    login,
    logout,
    getCsrfToken
} = require("../controllers/auth.controller");
const {validateRegister} = require("../middlewares/validateRegister");
const {validateLogin} = require("../middlewares/validateLogin");
const {loginLimiter} = require("../middlewares/loginLimiter");
const {verifyCsrf} = require("../middlewares/verifyCsrf");

authRouter.get("/csrf-token", getCsrfToken);
authRouter.post("/register", verifyCsrf, validateRegister,register);
authRouter.post("/login", loginLimiter, verifyCsrf, validateLogin,login);
authRouter.post("/logout", verifyCsrf, logout);

module.exports = authRouter;