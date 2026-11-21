
const express = require("express");

const app = express();

if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}

const helmet = require("helmet");
const cors = require("cors");

const authRouter = require("./routes/auth.routes");
const usersRouter = require("./routes/users.routes");
const adminRouter = require("./routes/admin.routes.js");
const { errorHandler } = require("./middlewares/errorHandler");

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,https://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
    res.status(200).json({ status: "success", message: "API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Page not found" });
});

module.exports = app;
