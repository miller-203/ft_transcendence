const { pool } = require("../config/db");

async function createUser(name, email, passwordHash) {

    const query = `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email;
    `;

    const result = await pool.query(query, [
        name,
        email,
        passwordHash
    ]);

    return result.rows[0];
}

async function findUserByEmail(email) {
    const query = `
        SELECT id, name, email, role, password_hash
        FROM users
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
}

async function findUserById(userId)
{
    const query = `
    SELECT id, name, email,
    role FROM users
    WHERE id = $1;
    `;

    const user = await pool.query(query, [userId]);

    return  user.rows[0];
}

module.exports = {
    createUser, findUserByEmail, findUserById
};