function validateRegister(req, res, next)
{
    const {firstName, lastName, email, password, type, role} = req.body ?? {};

    if (typeof firstName !== "string" || firstName.trim().length === 0 || typeof lastName !== "string" || lastName.trim().length === 0)
        return res.status(400).json({
            error: "Invalid first or last name"
        });
    if (typeof email !== "string" || !email.includes("@"))
        return res.status(400).json({
            error: "Invalid email"
        });
    if (firstName.length > 100 || lastName.length > 100)
        return res.status(400).json({
            error: "First or last name is too long"
        });
    if (email.length > 255)
        return res.status(400).json({
            error: "Email is too long"
        });
    if (typeof password !== "string" || password.length < 8)
        return res.status(400).json({
            error: "Invalid password, must be at least 8 characters"
        });
    if (typeof role !== "string" || !["USER", "ADMIN"].includes(role))
        return res.status(400).json({
            error: "Invalid role"
        });
    if (typeof type !== "string" || !["STUDENT", "PROFESSOR"].includes(type))
        return res.status(400).json({
            error: "Invalid type"
        });
    return next();
}

module.exports = {
    validateRegister
}
