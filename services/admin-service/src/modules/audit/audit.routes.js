import { Router } from "express";
import { getAuditLogs } from "./audit.controller.js";

const router = Router();
router.get("/", getAuditLogs);
export default router;
