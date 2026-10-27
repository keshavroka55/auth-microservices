import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

/**
 * Verifies the access token that auth-service issued.
 * We hold only the PUBLIC key, so we can check tokens but never forge them.
 *
 * `algorithms: ["RS256"]` is important: it pins the algorithm so an attacker
 * can't send a token claiming a different one (the classic "alg confusion" attack).
 *
 * NOTE: we answer 401 + code TOKEN_EXPIRED exactly like auth-service does, so the
 * client's refresh interceptor works the same for both services.
 */
export const verifyAccessToken = (req, res, next) => {
    const header = req.headers["authorization"];

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token missing" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_PUBLIC_KEY, {
            algorithms: ["RS256"],
            issuer: config.TOKEN_ISSUER,
        });
        req.user = decoded; // { id, email, role, iat, exp, iss }
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Invalid access token" });
    }
};
