import { Router } from "express";
import Announcement from "../models/Announcement.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getEmail, listInbox } from "../services/mailService.js";

const router = Router();
const notConfiguredMessage = "Mail is not configured. Set MAIL_USER and MAIL_APP_PASSWORD in .env";

function configured() {
  const user = process.env.MAIL_USER || "";
  const password = process.env.MAIL_APP_PASSWORD || "";
  return user && password && !user.includes("your-") && !password.includes("your-");
}

function configRequired(_req, res, next) {
  if (!configured()) return res.status(503).json({ error: { message: notConfiguredMessage, status: 503 } });
  next();
}

function invalidUid(uid) { return !/^\d+$/.test(uid); }
function mailError(res) { return res.status(500).json({ error: { message: "Unable to access mail inbox", status: 500 } }); }

router.use(requireAuth, requireRole("tpo"), configRequired);

router.get("/", async (_req, res) => {
  try {
    const inbox = await listInbox();
    const ids = inbox.map((email) => email.messageId).filter(Boolean);
    const forwarded = new Set((await Announcement.find({ sourceMessageId: { $in: ids } }).select("sourceMessageId").lean()).map((item) => item.sourceMessageId));
    res.json(inbox.map(({ messageId, ...email }) => ({ ...email, forwarded: forwarded.has(messageId) })));
  } catch { mailError(res); }
});

router.get("/:uid", async (req, res) => {
  if (invalidUid(req.params.uid)) return res.status(404).json({ error: { message: "Email not found", status: 404 } });
  try {
    const email = await getEmail(Number(req.params.uid));
    if (!email) return res.status(404).json({ error: { message: "Email not found", status: 404 } });
    res.json(email);
  } catch { mailError(res); }
});

router.post("/:uid/forward", async (req, res) => {
  if (invalidUid(req.params.uid)) return res.status(404).json({ error: { message: "Email not found", status: 404 } });
  try {
    const email = await getEmail(Number(req.params.uid));
    if (!email) return res.status(404).json({ error: { message: "Email not found", status: 404 } });
    if (await Announcement.exists({ sourceMessageId: email.messageId })) return res.status(409).json({ error: { message: "Already forwarded", status: 409 } });
    const announcement = await Announcement.create({ title: email.subject || "(No subject)", message: email.text, postedBy: req.session.user.id, sourceMessageId: email.messageId });
    res.status(201).json(announcement);
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: { message: "Already forwarded", status: 409 } });
    mailError(res);
  }
});

export default router;
