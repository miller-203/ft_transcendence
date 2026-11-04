
const crypto = require("crypto");

function verifyCsrf(req, res, next) {
    const receivedToken = req.get("X-CSRF-Token");
    const expectedToken = req.session.csrfToken;

    if (!receivedToken || !expectedToken)
        return res.status(403).json({
            error: "Invalid CSRF token"
        });
    const buffer1 = Buffer.from(receivedToken);
    const buffer2 = Buffer.from(expectedToken);
    if (buffer1.length !== buffer2.length)
        return res.status(403).json({
            error: "Invalid CSRF token"
        });
    const match = crypto.timingSafeEqual(buffer1, buffer2);
    if (!match)
        return res.status(403).json({
            error: "Invalid CSRF token"
        });
    return next(); 
}

module.exports = {
    verifyCsrf
}