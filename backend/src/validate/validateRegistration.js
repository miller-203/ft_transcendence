const { z } = require("zod");

const registrationSchema = z.object({
    firstName: z.string().min(5).max(100),
    lastName: z.string().min(5).max(100),
    email: z.string().email(),
    password: z.string().min(8).z.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
    status: z.enum(["ACTIVE", "BANNED"]),
    type: z.enum(["STUDENT", "PROFESSOR"]),
    role: z.enum(["USER", "ADMIN"])
});

function validateRegister(req, res, next)
{
    const {firstName, lastName, email, password, status, type, role} = req.body ?? {};

    try {
        registrationSchema.parse({firstName, lastName, email, password, status, type, role});
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
    return next();
}

module.exports = {
    validateRegister
}