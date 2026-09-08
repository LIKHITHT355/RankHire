import { Router } from "express";
import { login, logout, session, signup } from "../controllers/auth.controller.js";
const router = Router();
router.get("/session", session);
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
export default router;
