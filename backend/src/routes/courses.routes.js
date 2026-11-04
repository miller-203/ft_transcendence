const express = require("express");
const coursesRouter = express.Router();
const {requireAuth} = require("../middlewares/requrireAuth");
const {requireAdmin} = require("../middlewares/requireAdmin");
const {verifyCsrf} = require("../middlewares/verifyCsrf");

const {
    getCourses,
    getCoursebyId,
    postCourse,
    patchCourse,
    deleteCourse
} = require("../controllers/courses.controller");

coursesRouter.get("/", requireAuth, requireAdmin,getCourses);  
coursesRouter.get("/:id", getCoursebyId);  
coursesRouter.post("/", requireAuth , requireAdmin,verifyCsrf,postCourse); 
coursesRouter.patch("/:id", requireAuth , requireAdmin, verifyCsrf, patchCourse);
coursesRouter.delete("/:id",requireAuth , requireAdmin, verifyCsrf, deleteCourse);


module.exports = coursesRouter;