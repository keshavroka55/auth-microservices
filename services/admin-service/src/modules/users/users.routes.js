import { Router } from "express";
import { requireFreshAdmin } from "../../middleware/requireFreshAdmin.js";
import { listUsers, getUser, changeUserRole, revokeSessions } from "./users.controller.js";

const router = Router();

// reads: the role in the token is good enough
router.get("/", listUsers);
router.get("/:id", getUser);

// writes: double-check with the source of truth
router.patch("/:id/role", requireFreshAdmin, changeUserRole);
router.post("/:id/revoke-sessions", requireFreshAdmin, revokeSessions);

export default router;
