const {
    getAdminOverview,
    listUsers,
    updateUserStatus,
    deleteUser,
} = require("../services/admin.service");

function parseUserId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function getOverview(req, res, next) {
    try {
        return res.json(await getAdminOverview());
    } catch (error) {
        return next(error);
    }
}

async function getUsers(req, res, next) {
    const { search = "", status, type } = req.query;
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    if (typeof search !== "string" || search.length > 100 ||
        (status && !["ACTIVE", "BANNED"].includes(status)) ||
        (type && !["STUDENT", "TEACHER"].includes(type)) ||
        !Number.isSafeInteger(page) || page < 1 ||
        !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: "Invalid query parameters" });
    }
    try {
        return res.json(await listUsers({ search: search.trim(), status, type, page, pageSize }));
    } catch (error) {
        return next(error);
    }
}

async function setUserStatus(req, res, next) {
    const userId = parseUserId(req.params.id);
    if (!userId) return res.status(400).json({ error: "Invalid user id" });
    if (userId === req.user.id) return res.status(400).json({ error: "You cannot change your own account status" });
    const { status } = req.body ?? {};
    if (!["ACTIVE", "BANNED"].includes(status)) {
        return res.status(400).json({ error: "Status must be ACTIVE or BANNED" });
    }
    try {
        const result = await updateUserStatus(userId, status);
        if (!result.count) return res.status(404).json({ error: "User not found or cannot be managed" });
        return res.json({ message: `User ${status === "BANNED" ? "banned" : "unbanned"}` });
    } catch (error) {
        return next(error);
    }
}

async function removeUser(req, res, next) {
    const userId = parseUserId(req.params.id);
    if (!userId) return res.status(400).json({ error: "Invalid user id" });
    if (userId === req.user.id) return res.status(400).json({ error: "You cannot delete your own account" });
    try {
        const result = await deleteUser(userId);
        if (!result.count) return res.status(404).json({ error: "User not found or cannot be managed" });
        return res.json({ message: "User deleted" });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getOverview, getUsers, setUserStatus, removeUser };
