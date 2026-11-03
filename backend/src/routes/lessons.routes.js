const express = require("express");
const courseLessonsRouter = express.Router();
const {verifyCsrf}= require("../middlewares/verifyCsrf");
const {requireAuth} = require("../middlewares/requrireAuth");
const {requireAdmin} = require("../middlewares/requireAdmin");
const { getLessons , postLesson, patchLesson, removeLesson, getLesson} = require("../controllers/lessons.controller");

courseLessonsRouter.get("/:courseId/lessons", requireAuth, requireAdmin, getLessons);
courseLessonsRouter.get("/:courseId/lessons/:lessonId", requireAuth, getLesson);
courseLessonsRouter.post("/:courseId/lessons", requireAuth, requireAdmin, verifyCsrf, postLesson);
courseLessonsRouter.patch("/:courseId/lessons/:lessonId", requireAuth, requireAdmin, verifyCsrf, patchLesson);
courseLessonsRouter.delete("/:courseId/lessons/:lessonId", requireAuth, requireAdmin, verifyCsrf, removeLesson);

module.exports = courseLessonsRouter;