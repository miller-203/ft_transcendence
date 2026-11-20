const express = require("express");
const adminRouter = express.Router();

const {
    banUsers,
    unbanUsers,
    deleteUsers,
    deleteLessons,
    changeLessonsVisible,
    changeLessonsInvisible,
    changeStatusUsers
} = require("../controllers/admin.controller");

adminRouter.post("/banned-users/:id", banUsers);
adminRouter.post("/unban-users/:id", unbanUsers);
adminRouter.post("/delete-users/:id", deleteUsers);
adminRouter.post("/delete-lessons/:id", deleteLessons);
adminRouter.post("/change-lessons-visible/:id", changeLessonsVisible);
adminRouter.post("/change-lessons-invisible/:id", changeLessonsInvisible);
adminRouter.post("/change-status-users/:id", changeStatusUsers);

module.exports = adminRouter;
