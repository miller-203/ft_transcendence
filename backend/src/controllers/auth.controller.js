const { registerUser, loginUser, getUserProfile} = require("../services/auth.service");
const { signToken } = require("../lib/jwt");

async function register(req, res, next) {
    try {
        const user = await registerUser(req.body);
        return res.status(201).json({ user, token: signToken(user.id) });
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Username or email already exists"
            });
        }
        return next(error);
    }
}

async function login(req, res, next)
{
    const { identifier, password } = req.body ?? {};

    try{
        const user = await loginUser(identifier, password);

        if (user === undefined)
            return res.status(401).json({
                error: "Unauthorized"
            });
        if (user.status === "BANNED")
            return res.status(403).json({
                error: "Forbidden"
            });
        return res.status(200).json({ user, token: signToken(user.id) });
    }
    catch (error){
        return next(error);
    }

}

async function getMe(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    try {
        const user = await getUserProfile(req.user.id);

        if (user === undefined) {
            return res.status(404).json({
                error: "Not found"
            });
        }

        return res.status(200).json(user);
    }
    catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

module.exports = { register, login, getMe };
