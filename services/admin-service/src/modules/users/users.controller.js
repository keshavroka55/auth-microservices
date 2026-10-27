import * as authClient from "../../clients/authClient.js";
import { logAction } from "../audit/audit.service.js";

const ROLES = ["food_lover", "chef", "admin"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const badId = (res) => res.status(400).json({ message: "Invalid user id" });

export const listUsers = async (req, res) => {
    const { page, limit, search, role } = req.query;

    if (role && !ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role filter" });
    }

    const data = await authClient.listUsers({ page, limit, search, role });
    res.json(data);
};

export const getUser = async (req, res) => {
    if (!UUID.test(req.params.id)) return badId(res);
    res.json(await authClient.getUser(req.params.id));
};

export const changeUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body ?? {};

    if (!UUID.test(id)) return badId(res);
    if (!ROLES.includes(role)) {
        return res.status(400).json({ message: `role must be one of: ${ROLES.join(", ")}` });
    }
    if (id === req.user.id) {
        return res.status(400).json({ message: "You cannot change your own role" });
    }

    // auth-service changes the role AND revokes that user's refresh tokens.
    const result = await authClient.updateUserRole(id, role);

    await logAction({
        adminId: req.user.id,
        action: "USER_ROLE_CHANGED",
        targetUserId: id,
        metadata: { from: result.previousRole, to: role },
        ipAddress: req.ip,
    });

    res.json({ user: result.user, message: "Role updated" });
};

export const revokeSessions = async (req, res) => {
    const { id } = req.params;
    if (!UUID.test(id)) return badId(res);

    const result = await authClient.revokeUserSessions(id);

    await logAction({
        adminId: req.user.id,
        action: "USER_SESSIONS_REVOKED",
        targetUserId: id,
        metadata: { revokedCount: result.revokedCount },
        ipAddress: req.ip,
    });

    res.json({ message: "Sessions revoked", revokedCount: result.revokedCount });
};
