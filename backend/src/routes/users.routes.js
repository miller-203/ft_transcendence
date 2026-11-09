const express = require("express");
const usersRouter = express.Router();

const {
    getMe
} = require("../controllers/auth.controller")

const {requireAuth} = require("../middlewares/requireAuth");

usersRouter.get("/me", requireAuth, getMe);

module.exports = usersRouter;