function validateLogin(req, res, next) {
    const body = req.body ?? {};
    const identifier = body.identifier ?? body.username ?? body.email;
    const { password } = body;
    const errors = {};

    if (typeof identifier !== "string" || !identifier.trim() || identifier.trim().length > 254) {
        errors.identifier = "Username or email is required";
    }
    if (typeof password !== "string" || password.length < 1 || Buffer.byteLength(password, "utf8") > 72) {
        errors.password = "Password is required and must be at most 72 bytes";
    }

    if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", details: errors });

    req.body = { identifier: identifier.trim().toLowerCase(), password };
    return next();
}

module.exports = { validateLogin };
