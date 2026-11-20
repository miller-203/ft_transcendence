const {
    banUsersService,
    unbanUsersService, 
    deleteUsersService,
    deleteLessonsService, 
    changeLessonsVisibleService,
    changeLessonsInvisibleService, 
    changeStatusUsersService
} = require("../services/admin.service");

async function banUsers(req, res, next) {
    try {
        const { userIds } = req.body;
        await banUsersService(userIds);
        return res.status(200).json({ message: "Users banned successfully" });
    } catch (error) {
        return next(error);
    }
}

async function unbanUsers(req, res, next) {
    try {
        const { userIds } = req.body;
        await unbanUsersService(userIds);
        return res.status(200).json({ message: "Users unbanned successfully" });
    } catch (error) {
        return next(error);
    }
}

async function deleteUsers(req, res, next) {
    try {
        const { userIds } = req.body;
        await deleteUsersService(userIds);
        return res.status(200).json({ message: "Users deleted successfully" });
    } catch (error) {
        return next(error);
    }
}

async function deleteLessons(req, res, next) {
    try {
        const { lessonIds } = req.body;
        await deleteLessonsService(lessonIds);
        return res.status(200).json({ message: "Lessons deleted successfully" });
    } catch (error) {
        return next(error);
    }
}

async function changeLessonsVisible(req, res, next) {
    try {
        const { lessonIds } = req.body;
        await changeLessonsVisibleService(lessonIds);
        return res.status(200).json({ message: "Lessons visibility changed to visible successfully" });
    } catch (error) {
        return next(error);
    }
}

async function changeLessonsInvisible(req, res, next) {
    try {
        const { lessonIds } = req.body;
        await changeLessonsInvisibleService(lessonIds);
        return res.status(200).json({ message: "Lessons visibility changed to invisible successfully" });
    } catch (error) {
        return next(error);
    }
}

async function changeStatusUsers(req, res, next) {
    try {
        const { userIds, status } = req.body;
        await changeStatusUsersService(userIds, status);
        return res.status(200).json({ message: "Users status changed successfully" });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    banUsers,
    unbanUsers,
    deleteUsers,
    deleteLessons,
    changeLessonsVisible,
    changeLessonsInvisible,
    changeStatusUsers
};