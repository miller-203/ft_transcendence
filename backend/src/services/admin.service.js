const { prisma } = require("../config/prisma");

async function banUsersService(userIds) {
    await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status: "BANNED" },
    });
}

async function unbanUsersService(userIds) {
    await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status: "ACTIVE" },
    });
}

async function deleteUsersService(userIds) {
    await prisma.user.deleteMany({
        where: { id: { in: userIds } },
    });
}

async function deleteLessonsService(lessonIds) {
    await prisma.lesson.deleteMany({
        where: { id: { in: lessonIds } },
    });
}

async function changeLessonsVisibleService(lessonIds) {
    await prisma.lesson.updateMany({
        where: { id: { in: lessonIds } },
        data: { isVisible: true },
    });
}

async function changeLessonsInvisibleService(lessonIds) {
    await prisma.lesson.updateMany({
        where: { id: { in: lessonIds } },
        data: { isVisible: false },
    });
}

async function changeStatusUsersService(userIds, status) {
    await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status },
    });
}

module.exports = {
    banUsersService,
    unbanUsersService,
    deleteUsersService,
    deleteLessonsService,
    changeLessonsVisibleService,
    changeLessonsInvisibleService,
    changeStatusUsersService
};