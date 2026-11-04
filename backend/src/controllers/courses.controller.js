const { findCourseById, createCourse, updateCourse, deleteCourseById, validateGetCourse} = require("../services/courses.service");

const allowLevels = [
    "beginner",
    "intermediate",
    "advanced"
];

async function getCourses(req, res){
    const {
        level,
        search,
        sort,
        order,
        page,
        limit
    } = req.query;

    const result = await validateGetCourse(
        level,
        search,
        sort,
        order,
        page,
        limit
    );

    if (result === undefined) {
        return res.status(400).json({
            error: "bad request"
        });
    }

    return res.status(200).json(result);
};

async function getCoursebyId(req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({
            error: "Bad request"
        });

    const result = await findCourseById(id);
    if (!result)
    {
        return res.status(404).json({
            error: "course not found"
        });
    }

    res.status(200).json(result);
};

async function postCourse(req, res) {
    const { title, level } = req.body;

    if (!title || !level) {
        return res.status(400).json({
            error: "Title and level are required"
        });
    }

    if (
        typeof title !== "string" ||
        typeof level !== "string" ||
        !title.trim() ||
        !allowLevels.includes(level)
    ) {
        return res.status(400).json({
            error: "Bad request"
        });
    }

    try {
        const temp = await createCourse(title, level);

        return res.status(201).json(temp);
    }
    catch (error) {
        console.error("Database error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

async function patchCourse(req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
            return res.status(400).json({
                error: "bad request"
            });
    // Validate title if it was provided
    const { title, level } = req.body;
    if (title === undefined && level === undefined) {
        return res.status(400).json({
            error: "At least one field is required"
        });
    }

    if (title !== undefined) {
        if (typeof title !== "string" ||
             title.length === 0 ||
                !title.trim()) {
            return res.status(400).json({
                error: "bad request"
            });
        }
    }

    if (level !== undefined) {
        if (typeof level !== "string" ||
             level.length === 0 || 
                !level.trim()) {
            return res.status(400).json({
                error: "bad request"
            });
        }

        if (!allowLevels.includes(level)) {
            return res.status(400).json({
                error: "bad request"
            });
        }
    }

    const result = await updateCourse(id, title, level);

    if (!result) {
        return res.status(404).json({
            error: "course not found"
        });
    }

    return res.status(200).json(result);
};

async function deleteCourse(req, res) {

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
            return res.status(400).json({
                error: "bad request"
            });
    
    try{

        const result = await deleteCourseById(id);
        if (!result)
            return res.status(404).json({
                "error":"Course not found"
            });

        res.status(204).send();
    }
    catch (error)
    {
        console.error("DELETE course failed:", error);
        res.status(500).json({
        error: "Internal Server Error"
        }); 
    }
};

module.exports = {
    getCourses,
    getCoursebyId,
    patchCourse,
    postCourse,
    deleteCourse
    };