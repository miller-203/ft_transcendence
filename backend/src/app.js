// Import Express to create our backend server.
const express = require("express");

// Create our Express application.
const app = express();

if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}

// Import express-session to manage user login sessions.
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { pool } = require("./config/db");

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

    // Allow credentialed cross-origin requests, including session cookies.
    credentials: true
}));

// Convert incoming JSON request bodies into req.body.
app.use(express.json());

// Configure session management for logged-in users.
app.use(session({
    // Set the name of the session cookie.
    name: "sid",

    store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: false
    }),
    // Secret used to sign the session ID cookie.

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60
    }
}));

// Connect authentication routes to URLs starting with /auth.
app.use("/auth", authRouter);

// Connect user routes to URLs starting with /users.
app.use("/users", usersRouter);

// Handle errors forwarded by routes and middleware.
app.use(errorHandler);

module.exports = app;
