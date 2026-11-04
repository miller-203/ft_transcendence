const {getLessonsForCourse, postLessonLogic, patchLessonLogic, deleteLessonLogic, getLessonLogic} = require("../services/lessons.service");

async function getLessons(req, res){
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0)
        return res.status(400).json({
            error: "Bad Request"
        });
    
    try 
    {
        const result = await getLessonsForCourse(courseId);
        return res.status(200).json(result);
    }
    catch (error)
    {
        console.error("database error", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

async function getLesson(req, res) {
    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);

    if (
        !Number.isInteger(courseId) || courseId <= 0 ||
        !Number.isInteger(lessonId) || lessonId <= 0
    ) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    try {
        const lesson = await getLessonLogic(courseId, lessonId);

        if (!lesson) {
            return res.status(404).json({
                error: "Lesson not found"
            });
        }

        return res.status(200).json(lesson);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

async function postLesson(req, res) {

    const courseId = Number(req.params.courseId);
    const { title, content } = req.body;

    if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
            error: "Bad Request"
        });
    }

    if (title === undefined || content === undefined) {
        return res.status(400).json({
            error: "Title and content are required"
        });
    }

    if (
        typeof title !== "string" ||
        typeof content !== "string" ||
        !title.trim() ||
        !content.trim()
    ) {
        return res.status(400).json({
            error: "Bad Request"
        });
    }

    try {
        const result = await postLessonLogic(courseId, title, content);

        return res.status(201).json(result);
    }
    catch (error) {
        if (error.code === "23503") {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        console.error("Database error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

async function patchLesson(req, res){

    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);

    if (!Number.isInteger(courseId) || !Number.isInteger(lessonId)
        || courseId <= 0 || lessonId <= 0){
        return res.status(400).json({ error: "Invalid ID" });
    }

    const {title, content} = req.body;
    if (title === undefined && content === undefined){
        return res.status(400).json({
                    error: "Provide title or content"
                });
    }
    if (
        (title !== undefined &&
            (typeof title !== "string" || !title.trim())) ||
        (content !== undefined &&
            (typeof content !== "string" || !content.trim()))) {
        return res.status(400).json({
            error: "Invalid title or content"
        });
    }

    try{
        const result = await patchLessonLogic(courseId, lessonId, title, content);
        if (!result)
            return res.status(404).json({
                error: "Lesson not found"
            });
        return res.status(200).json(result);
    }
    catch(error)
    {
          console.error(error);
        return res.status(500).json({
            error: "Internal Server Error"
        });      
    }

}

async function removeLesson(req, res) {

    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);

    if (
        !Number.isInteger(courseId) || courseId <= 0 ||
        !Number.isInteger(lessonId) || lessonId <= 0
    ) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    try {
        const result = await deleteLessonLogic(courseId, lessonId);

        if (!result) {
            return res.status(404).json({
                error: "Lesson not found"
            });
        }

        return res.status(204).send();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

module.exports = {
    getLessons, postLesson, patchLesson, removeLesson, getLesson
};