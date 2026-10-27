import prisma from "../../prisma.js";

export const logAction = async ({ adminId, action, targetUserId, metadata, ipAddress }) => {
    try {
        return await prisma.auditLog.create({
            data: { adminId, action, targetUserId, metadata, ipAddress },
        });
    } catch (err) {
        // The action already happened in auth-service, so don't fail the request.
        // (Later improvement: an "outbox" so a failed log is retried, not lost.)
        console.error("AUDIT LOG FAILED:", { adminId, action, targetUserId }, err);
    }
};

export const listAuditLogs = async ({ page, limit, adminId, targetUserId, action }) => {
    const where = {
        ...(adminId && { adminId }),
        ...(targetUserId && { targetUserId }),
        ...(action && { action }),
    };

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, page, limit, total };
};
