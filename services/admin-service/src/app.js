import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import { verifyAccessToken } from "./middleware/verifyAccessToken.js";
import { requireRole } from "./middleware/role.middleware.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes.js";

const app = express();

app.set("trust proxy", 1); // we sit behind Nginx

app.use(express.json());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));

// Public: no token needed (used by Docker/Nginx health checks)
app.get("/api/admin/health", (req, res) => {
    res.json({ status: "ok", service: "admin-service", timestamp: new Date().toISOString() });
});

// Everything below this line requires a valid token AND the admin role.
app.use("/api/admin", verifyAccessToken, requireRole("admin"), routes);

app.use(notFound);
app.use(errorHandler);

export default app;
