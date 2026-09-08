import { Router } from "express"; import { list } from "../controllers/ranking.controller.js"; import { requireAuth } from "../middleware/requireAuth.js"; import { requireRole } from "../middleware/requireRole.js";
const router = Router(); router.get("/", requireAuth, requireRole("tpo"), list); export default router;
