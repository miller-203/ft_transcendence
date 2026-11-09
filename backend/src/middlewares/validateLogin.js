function validateLogin(req, res, next)
{

    const {email, password} = req.body ?? {};

    if (typeof email !== "string" || !email.includes("@"))
        return res.status(400).json({
            error: "Invalid email"
        });
    if (email.length > 255) {
        return res.status(400).json({
            error: "email is too long"
        });
    }
    if (typeof password !== "string" || password.length === 0)
        return res.status(400).json({
            error: "Invalid password"
        });
    next();
}

module.exports = {validateLogin}