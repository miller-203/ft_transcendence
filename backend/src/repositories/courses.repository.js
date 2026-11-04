// const courses = require("../data/courses");
const {pool} = require("../config/db");

async function getCourseById(id){

    // console.log("Repository received ID:", id);
    // console.trace("Who called the repository?");
    const sqlQuer = "SELECT * FROM courses WHERE id = $1";
    const result = await pool.query(sqlQuer, [id]);
    return result.rows[0];
};

const getCourseByLevel = (courses, level) => {

    return  courses.filter((course) => {
        return course.level === level
    });
};

const getCoursesByFiltering = (result, search) => {

    return  result.filter((course) => {
        return course.title
            .toLowerCase()
            .includes(search.toLowerCase());
    });
};

const getCoursesByOrder = (result, order) => {

    let sortOrder = "asc";

    if (order !== undefined) {
        if (order !== "asc" && order !== "desc")
            return undefined;

        sortOrder = order;
    }

    result.sort((a, b) => {
        if (sortOrder === "asc")
            return a.title.localeCompare(b.title);
        else
            return b.title.localeCompare(a.title);
    });
    return result;
};

const getCourseByLimitPage = (result, startIndex, endIndex) => {

    return   result.slice(startIndex, endIndex);
};

async function getAllCourses(){
    const result = await pool.query("SELECT * FROM courses");
    return result.rows;
}

async function earaseCourse (id) {
    const execQuery = `DELETE FROM courses
     WHERE id = $1
     RETURNING *;`;
    const result = await pool.query(execQuery, [id]);

    return result.rows[0];
};


async function checkUpdate(id, title, level){
    const execQuery = `
        UPDATE courses
        SET
            title = COALESCE($2, title),
            level = COALESCE($3, level)
        WHERE id = $1
        RETURNING *;
    `;

    const dbResult = await pool.query(execQuery, [id, title, level]);

    return dbResult.rows[0];
};

async function addCourseToCourses(title, level) {
    const execQuery = ` 
        INSERT INTO courses (title, level)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const result = await pool.query(execQuery, [title, level]);

    return result.rows[0];
};
module.exports = {
    getCourseById, addCourseToCourses, checkUpdate, earaseCourse, getCourseByLevel, getAllCourses, getCoursesByFiltering, getCoursesByOrder, getCourseByLimitPage
};