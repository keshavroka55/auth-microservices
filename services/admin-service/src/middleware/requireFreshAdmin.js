import { getUser } from "../clients/authClient.js";

/**
 * Use on DANGEROUS routes (role changes, session revokes).
 *
 * The role inside an access token can be up to 15 minutes old. If an admin was
 * demoted 2 minutes ago, their token still says "admin". For sensitive actions we
 * ask the auth-service (source of truth) whether they are STILL an admin.
 */
export const requireFreshAdmin = async (req, res, next) => {
    const { user } = await getUser(req.user.id);
    if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin privileges have been revoked" });
    }
    next();
};
