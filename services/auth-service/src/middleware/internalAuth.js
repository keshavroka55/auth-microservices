import crypto from "crypto";
import { config } from "../config/config.js";

/**
 * Guards /internal/* routes. Callers are other SERVICES, not users, so there is
 * no user JWT here: just a shared secret in the x-internal-key header.
 */
export const internalAuth = (req, res, next) => {
    const provided = req.headers["x-internal-key"];
    const expected = config.INTERNAL_API_KEY;

    if (!expected) {
        console.error("INTERNAL_API_KEY is not set; refusing all internal calls");
        return res.status(503).json({ message: "Internal API not configured" });
    }
    if (typeof provided !== "string") {
        return res.status(401).json({ message: "Invalid internal key" });
    }

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);

    // timingSafeEqual throws if lengths differ, so check length first
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ message: "Invalid internal key" });
    }
    next();
};
