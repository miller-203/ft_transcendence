
const express = require("express");

// Create our Express application.
const app = express();

if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}

// Import Helmet to add security headers to HTTP responses.
const helmet = require("helmet");

// Import CORS to control which frontend origins can read API responses.
const cors = require("cors");

const authRouter = require("./routes/auth.routes");

// Import routes that handle user requests.
const usersRouter = require("./routes/users.routes");

// Import middleware that handles unexpected errors.
const { errorHandler } = require("./middlewares/errorHandler");


// Add security headers to responses.
app.use(helmet());

// Configure which frontend can access our API through the browser.
app.use(cors({
    // Allow requests from this frontend origin.
    origin: process.env.FRONTEND_URL || "https://localhost:3000",

    // Clients authenticate with Authorization: Bearer tokens.
}));

// Convert incoming JSON request bodies into req.body.
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
  });
});

// Connect authentication routes to URLs starting with /auth.
app.use("/api/auth", authRouter);

// Connect user routes to URLs starting with /users.
app.use("/api/users", usersRouter);

// Handle errors forwarded by routes and middleware.
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Page not found" });
});

module.exports = app;
