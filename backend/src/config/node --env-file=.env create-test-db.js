const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: "postgres",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function createTestDatabase() {
    try {
        await pool.query("CREATE DATABASE learning_platform_test");
        console.log("Test database created successfully!");
    } catch (error) {
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

createTestDatabase();