const { z } = require("zod");

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).z.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
});

function validateLogin(req, res, next)
{

    const {email, password} = req.body ?? {};

    try {
        loginSchema.parse({email, password});
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
    next();
}

module.exports = {validateLogin}        
