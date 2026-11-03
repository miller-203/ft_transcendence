const {pool} = require("../config/db");

async function getLessonsByCourseId(courseId){

    const execQuery = "SELECT * FROM lessons WHERE course_id = $1";
    const result = await pool.query(execQuery, [courseId]);
    return result.rows;
}

async function getLessonById(courseId, lessonId) {
    const query = `
        SELECT * FROM lessons
        WHERE course_id = $1 AND id = $2;
    `;

    const result = await pool.query(query, [courseId, lessonId]);
    return result.rows[0];
}

async function createLesson(courseId, title, content){

    const execQuery = `INSERT INTO lessons(course_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING *;`;

    const result = await pool.query(execQuery,
        [courseId, 
        title, 
        content]);

    return result.rows[0];
}
async function updateLesson(courseId, lessonId, title, content) {
    const query = `
        UPDATE lessons
        SET
            title = COALESCE($3, title),
            content = COALESCE($4, content)
        WHERE id = $2 AND course_id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [
        courseId,
        lessonId,
        title,
        content
    ]);

    return result.rows[0];
}

async function deleteLesson(courseId, lessonId)
{
    const query = `
        DELETE FROM lessons
        WHERE id = $2 AND course_id = $1
        RETURNING *;`;

    const result = await pool.query(query, [courseId, lessonId]);

    return result.rows[0];
}

module.exports = {
    getLessonsByCourseId, createLesson, deleteLesson, updateLesson, getLessonById
};
