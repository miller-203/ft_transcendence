const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");

async function registerUser(firstName, lastName, email, password, status, type, role) {

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { firstName, lastName, email: email.toLowerCase(), password: passwordHash, status: status, type: type, role: role },
        select: { id: true, firstName: true, lastName: true, email: true, status: true, type: true, role: true }
    });

    return { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, status: user.status, type: user.type, role: user.role };
}

async function loginUser(email, password) {

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user)
        return undefined;

    const isValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isValid)
        return undefined;

    return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        status: user.status,
        role: user.role,
        type: user.type
    };
}

async function getUserProfile(userId)
{
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, firstName: true, lastName: true, email: true, status: true, type: true, role: true, createdAt: true }
    });

    return user ? { ...user, name: `${user.firstName} ${user.lastName}` } : undefined;
}


module.exports = { registerUser, loginUser, getUserProfile};
