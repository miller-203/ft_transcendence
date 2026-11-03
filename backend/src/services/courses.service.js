const { getCourseById, addCourseToCourses, checkUpdate,earaseCourse, getCourseByLevel,  getCoursesByFiltering, getCoursesByOrder, getCourseByLimitPage, getAllCourses} = require("../repositories/courses.repository");

async function findCourseById(id) {

    const result = await getCourseById(id);
    return result;
};

async function createCourse(title, level) {
    
    const newCourse = await addCourseToCourses(title, level);
    return newCourse;
};

async function updateCourse (id, title, level) {

    return await checkUpdate(id, title, level);
};

async function deleteCourseById(id) {

    const result = await earaseCourse(id);
    return result;
};

const allowedLevels = [
    "beginner",
    "intermediate",
    "advanced"
];

async function validateGetCourse(
    level,
    search,
    sort,
    order,
    page,
    limit
){
    let result = await getAllCourses();

    // Level
    if (level !== undefined) {
        if (!allowedLevels.includes(level))
            return undefined;
        result = getCourseByLevel(result, level);
    }

    // Search
    if (search !== undefined) {
        result = getCoursesByFiltering(result, search);
    }

    // Sorting
    // Sorting
    if (sort !== undefined) {
        if (sort !== "title")
            return undefined;

        if (order !== undefined) {
            if (order !== "asc" && order !== "desc")
                return undefined;
        }

        result = getCoursesByOrder(result, order);
    }
    else if (order !== undefined) {
        return undefined;
    }

    // Pagination
    if (page !== undefined) {
        const pageNumber = Number(page);

        if (!Number.isInteger(pageNumber) || pageNumber <= 0)
            return undefined;

        let limitNumber = 10;

        if (limit !== undefined) {
            limitNumber = Number(limit);

            if (!Number.isInteger(limitNumber) || limitNumber <= 0)
                return undefined;
        }

        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = startIndex + limitNumber;
        result = getCourseByLimitPage(result, startIndex, endIndex);
    }
    else if (limit !== undefined) {
        return undefined;
    }

    return result;
};

module.exports = {
    findCourseById,
    createCourse,
    updateCourse,
    deleteCourseById,
    validateGetCourse
};