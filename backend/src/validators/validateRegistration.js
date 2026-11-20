const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

function validateRegister(req, res, next) {
    const { firstName, lastName, username, email, password } = req.body ?? {};
    const errors = {};

    if (typeof firstName !== "string" || firstName.trim().length < 1 || firstName.trim().length > 100) {
        errors.firstName = "First name is required and must be at most 100 characters";
    }
    if (typeof lastName !== "string" || lastName.trim().length < 1 || lastName.trim().length > 100) {
        errors.lastName = "Last name is required and must be at most 100 characters";
    }
    if (typeof username !== "string" || !USERNAME_PATTERN.test(username.trim().toLowerCase())) {
        errors.username = "Username must be 3–30 characters and use only letters, numbers, or underscores";
    }
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "A valid email address is required";
    }
    if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        errors.password = "Password must be at least 8 characters and at most 72 bytes";
    }

    if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", details: errors });

    req.body = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
    };
    return next();
}

module.exports = { validateRegister };
