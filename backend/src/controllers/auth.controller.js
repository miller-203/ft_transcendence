const { registerUser, loginUser, getUserProfile} = require("../services/auth.service");
const crypto = require("crypto");

async function register(req, res, next) {
    const { name, email, password } = req.body ?? {};

    try {
        const user = await registerUser(name, email, password);

        return res.status(201).json(user);
    }
    catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }
        return next(error);
    }
}

async function login(req, res, next)
{
    const { email, password } = req.body ?? {};

    try{
        const user = await loginUser(email, password);

        if (user === undefined)
            return res.status(401).json({
                error: "Unauthorized"
            });
        req.session.regenerate((error) => {
            if (error) {
                return next(error)
            }

            req.session.userId = user.id;

            req.session.save((error) => {
                if (error) 
                    return next(error)
                return res.status(200).json(user);
            });
        });
    }
    catch (error){
        return next(error);
    }

}

async function getMe(req, res) {
    const userId = req.session?.userId;

    if (userId === undefined) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    try {
        const user = await getUserProfile(userId);

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

async function logout(req, res){

    if (!req.session){
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    req.session.destroy((error) => {
        if (error){
            console.error("Logout error:", error);
            return res.status(500).json({
                error: "Internal Server Error"
            });
        }
        res.clearCookie("sid");
        return res.status(204).end();
    });

}

function getCsrfToken(req, res, next){

    if (req.session.csrfToken){
        return res.status(200).json({
            csrfToken: req.session.csrfToken
        });
    }
    const token = crypto.randomBytes(32).toString("hex");
    req.session.csrfToken = token;
    return res.status(200).json({
        csrfToken: token 
    });
}

module.exports = { register , login, getMe, logout, getCsrfToken};