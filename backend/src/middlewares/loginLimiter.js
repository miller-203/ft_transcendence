const {rateLimit} = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,

    skip:() => process.env.NODE_ENV === "test",

    message: {
        error: "Too many login attempts"
    }
});

module.exports = {
    loginLimiter
}