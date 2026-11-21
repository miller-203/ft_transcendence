const { prisma } = require("../config/prisma");

const userFields = {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    email: true,
    status: true,
    type: true,
    role: true,
    createdAt: true,
};

async function getAdminOverview() {
    const [totalUsers, activeUsers, bannedUsers, students, teachers, admins] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { status: "BANNED" } }),
        prisma.user.count({ where: { type: "STUDENT" } }),
        prisma.user.count({ where: { type: "TEACHER" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
    ]);
    return { totalUsers, activeUsers, bannedUsers, students, teachers, admins };
}

async function listUsers({ search, status, type, page, pageSize }) {
    const where = {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(search ? {
            OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ],
        } : {}),
    };
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: userFields,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.user.count({ where }),
    ]);
    return { users, total, page, pageSize };
}

async function updateUserStatus(userId, status) {
    return prisma.user.updateMany({
        where: { id: userId, role: "USER" },
        data: { status },
    });
}

async function deleteUser(userId) {
    return prisma.user.deleteMany({ where: { id: userId, role: "USER" } });
}

module.exports = { getAdminOverview, listUsers, updateUserStatus, deleteUser };
