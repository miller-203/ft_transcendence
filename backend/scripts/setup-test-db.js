const bcrypt = require("bcrypt");
const { pool } = require("../src/config/db");

async function seedTestUsers() {
    try {
        // Safety check
        if (process.env.NODE_ENV !== "test" ||
            process.env.DB_NAME !== "learning_platform_test") {
            throw new Error("This script can only run on the test database");
        }

        const password = process.env.TEST_USER_PASSWORD;

        if (!password || password.length < 8) {
            throw new Error("Set TEST_USER_PASSWORD in .env.test");
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email, role`,
            ["Backend Test", "backendtest@example.com", passwordHash, "student"]
        );
            const adminPassword = process.env.TEST_ADMIN_PASSWORD;

        if (!adminPassword || adminPassword.length < 8) {
            throw new Error("Set TEST_ADMIN_PASSWORD in .env.test");
        }

        const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

        const adminResult = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email, role`,
            [
                "Admin Test",
                "admintest@example.com",
                adminPasswordHash,
                "admin"
            ]
        );

        console.log(adminResult.rows);
        console.log(result.rows);
    } catch (error) {
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

seedTestUsers();