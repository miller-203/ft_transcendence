const bcrypt = require("bcrypt");
const { prisma } = require("../config/prisma");

async function registerUser(name, email, password) {

    const passwordHash = await bcrypt.hash(password, 12);

    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
    const user = await prisma.user.create({
        data: { firstName, lastName: lastNameParts.join(" ") || firstName, email: email.toLowerCase(), password: passwordHash },
        select: { id: true, firstName: true, lastName: true, email: true }
    });

    return { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email };
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
        role: user.role
    };
}

async function getUserProfile(userId)
{
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, firstName: true, lastName: true, email: true, type: true, role: true, createdAt: true }
    });

    return user ? { ...user, name: `${user.firstName} ${user.lastName}` } : undefined;
}


module.exports = { registerUser, loginUser, getUserProfile};
