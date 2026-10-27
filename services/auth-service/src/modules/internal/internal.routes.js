import { Router } from "express";
import { internalAuth } from "../../middleware/internalAuth.js";
import { listUsers, getUser, updateUserRole, revokeSessions } from "./internal.controller.js";

const router = Router();

router.use(internalAuth);

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id/role", updateUserRole);
router.post("/users/:id/revoke-sessions", revokeSessions);

export default router;
