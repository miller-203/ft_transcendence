const {rateLimit} = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,

    skip:() => process.env.NODE_ENV === "test",

    message: { error: "Too many login attempts" },
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    skip: () => process.env.NODE_ENV === "test",
    message: { error: "Too many registration attempts" },
});

module.exports = { loginLimiter, registerLimiter };
