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
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, status: true, role: true },
        });
        if (!user)
        {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        if (user.status === "BANNED") {
            return res.status(403).json({ error: "Forbidden" });
        }
        req.user = user;
        return next();
    }
    catch (error){

        console.error("Database error:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
    }
    return next();
}

module.exports = { requireAuth, requireAdmin };
