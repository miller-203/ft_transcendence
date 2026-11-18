const { prisma } = require("../config/prisma");
const { verifyToken } = require("../lib/jwt");

async function requireAuth(req, res, next) {

    const authorization = req.get("Authorization") || "";
    const [scheme, token, extra] = authorization.split(" ");
    if (scheme !== "Bearer" || !token || extra) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    let userId;
    try {
        ({ userId } = verifyToken(token));
    } catch {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
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
