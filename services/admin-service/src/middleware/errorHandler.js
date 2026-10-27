import { UpstreamError } from "../clients/authClient.js";

export const notFound = (req, res) => {
    res.status(404).json({ message: "Route not found" });
};

// Express 5 forwards errors from async handlers here automatically.
export const errorHandler = (err, req, res, next) => {
    if (err instanceof UpstreamError) {
        // IMPORTANT: never pass auth-service's 401/403 to the browser. A 401 would
        // make the client think the USER's token expired and trigger a refresh loop.
        // A 401/403 from upstream means OUR service is misconfigured (bad internal key).
        if (err.status === 401 || err.status === 403) {
            console.error("auth-service rejected our internal call:", err.message);
            return res.status(502).json({ message: "Upstream service error" });
        }
        return res.status(err.status).json({ message: err.message });
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON body" });
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
};
