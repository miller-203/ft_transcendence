
function validateRegister(req, res, next)
{
    const {name, email, password} = req.body ?? {};

    if (typeof name !== "string" || name.trim().length === 0)
        return res.status(400).json({
            error: "Invalid name"
        });
    if (typeof email !== "string" || !email.includes("@"))
        return res.status(400).json({
            error: "Invalid email"
        });
    if (name.length > 100 )
        return res.status(400).json({
            error: "Name is too long"
        });
    if (email.length > 255) 
        return res.status(400).json({
            error: "email is too long"
        });
    if (typeof password !== "string" || password.length < 8)
        return res.status(400).json({
            error: "Invalid password, must be at least 8 characters"
        });
    return next();
}

module.exports = {
    validateRegister
}