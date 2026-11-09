const bcrypt = require("bcrypt");
const { createUser, findUserByEmail, findUserById} = require("../repositories/users.repository.js");

async function registerUser(name, email, password) {

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser(name, email, passwordHash);

    return user;
}

async function loginUser(email, password) {

    const user = await findUserByEmail(email);

    if (!user)
        return undefined;

    const isValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isValid)
        return undefined;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

async function getUserProfile(userId)
{
    const user = await findUserById(userId);

    return user;
}


module.exports = { registerUser, loginUser, getUserProfile};