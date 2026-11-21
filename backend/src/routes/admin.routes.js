const express = require("express");
const { requireAuth, requireAdmin } = require("../middlewares/requireAuth");
const { getOverview, getUsers, setUserStatus, removeUser } = require("../controllers/admin.controller");

const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/overview", getOverview);
adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id/status", setUserStatus);
adminRouter.delete("/users/:id", removeUser);

module.exports = adminRouter;
