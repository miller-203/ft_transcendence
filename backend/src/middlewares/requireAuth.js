const {findUserById} = require("../repositories/users.repository");

async function requireAuth(req, res, next) {

    const userId = req.session?.userId;
    try {

        if (!userId)
            return res.status(401).json({
                error: "Unauthorized"
            });
        const user = await findUserById(userId);
        if (!user)
        {
            return res.status(401).json({
                error: "User Doesn't Exist"
            });
        }
        req.user = user;
        next();
    }
    catch (error){

        console.error("Database error:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

module.exports = { requireAuth };