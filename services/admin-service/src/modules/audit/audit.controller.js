import { listAuditLogs } from "./audit.service.js";

const toInt = (value, fallback, min, max) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(Math.max(n, min), max);
};

export const getAuditLogs = async (req, res) => {
    const { adminId, targetUserId, action } = req.query;
    const result = await listAuditLogs({
        page: toInt(req.query.page, 1, 1, 100000),
        limit: toInt(req.query.limit, 20, 1, 100),
        adminId,
        targetUserId,
        action,
    });
    res.json(result);
};
