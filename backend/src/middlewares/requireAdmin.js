
async function requireAdmin(req, res, next) {

    const user = req.user;

    if (!user)
        return res.status(401).json({
            error: "Unauthorized"
    });
    if (user.role !== "admin")
    {
        return res.status(403).json({
            error: "Forbidden"
        });
    }
    next();
}

module.exports = {
    requireAdmin
};