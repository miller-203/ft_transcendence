const fs = require("node:fs/promises");
const path = require("node:path");
const { pool } = require("../src/config/db");

async function runMigrations() {
    try {
        const filePath = path.join(
            __dirname,
            "../migrations/001_create_user_sessions.sql"
        );

        const sql = await fs.readFile(filePath, "utf8");

        await pool.query(sql);

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

runMigrations();