const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");

const publicUserSelect = {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    email: true,
    status: true,
    type: true,
    role: true,
};

function toPublicUser(user) {
    return {
        ...user,
        name: `${user.firstName} ${user.lastName}`,
    };
}

async function registerUser({ firstName, lastName, username, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { firstName, lastName, username, email, password: passwordHash },
        select: publicUserSelect,
    });

    return toPublicUser(user);
}

async function loginUser(identifier, password) {
    const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) return undefined;
    return toPublicUser({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        status: user.status,
        type: user.type,
        role: user.role,
    });
}

async function getUserProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { ...publicUserSelect, createdAt: true },
    });

    return user ? toPublicUser(user) : undefined;
}

module.exports = { registerUser, loginUser, getUserProfile };
