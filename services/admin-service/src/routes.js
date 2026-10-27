import { Router } from "express";
import usersRoutes from "./modules/users/users.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";

const router = Router();
router.use("/users", usersRoutes);
router.use("/audit-logs", auditRoutes);

export default router;
