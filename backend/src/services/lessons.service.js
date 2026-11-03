const {getLessonsByCourseId, createLesson, updateLesson, deleteLesson, getLessonById} = require("../repositories/lessons.repository");

async function getLessonsForCourse(courseId){

    const result = await getLessonsByCourseId(courseId);
    
    return result;
}

async function getLessonLogic(courseId, lessonId) {
    return await getLessonById(courseId, lessonId);
}

async function postLessonLogic(courseId, title, content){

    const result = await createLesson(courseId, title, content);

    return result;
}
async function patchLessonLogic(courseId, lessonId, title, content){

   const result = await updateLesson(courseId, lessonId, title, content);

   return result;
}

async function deleteLessonLogic(courseId, lessonId){

   const result = await deleteLesson(courseId, lessonId);

   return result;
}


module.exports = {
    getLessonsForCourse, postLessonLogic, patchLessonLogic, deleteLessonLogic, getLessonLogic
}