import { Router } from "express"; import { list } from "../controllers/companies.controller.js"; import { requireAuth } from "../middleware/requireAuth.js";
const router = Router(); router.get("/", requireAuth, list); export default router;
