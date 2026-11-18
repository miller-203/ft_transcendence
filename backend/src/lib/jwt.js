const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60;
const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret && secret.length >= 32) return secret;
    if (process.env.NODE_ENV !== "production") return "local-only-jwt-secret-change-before-deploy";
    throw new Error("JWT_SECRET must be set to at least 32 characters in production");
}

function signToken(userId) {
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ sub: String(userId), iat: now, exp: now + TOKEN_TTL_SECONDS })).toString("base64url");
    const input = `${encodedHeader}.${payload}`;
    const signature = crypto.createHmac("sha256", getSecret()).update(input).digest("base64url");
    return `${input}.${signature}`;
}

function verifyToken(token) {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== encodedHeader) throw new Error("Invalid token");

    const input = `${parts[0]}.${parts[1]}`;
    const expected = crypto.createHmac("sha256", getSecret()).update(input).digest();
    let received;
    try {
        received = Buffer.from(parts[2], "base64url");
    } catch {
        throw new Error("Invalid token");
    }
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) throw new Error("Invalid token");

    let payload;
    try {
        payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    } catch {
        throw new Error("Invalid token");
    }
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new Error("Invalid token");
    }
    return { userId };
}

module.exports = { signToken, verifyToken };
