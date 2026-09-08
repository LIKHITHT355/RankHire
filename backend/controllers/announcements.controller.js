import Announcement from "../models/Announcement.js";

// This lists announcements newest first for every signed-in user.
// Poster details are included only as safe public account fields.
// The collection may simply be empty on a new installation.
export async function list(req, res, next) { try { res.json(await Announcement.find().populate("postedBy", "name email").sort({ createdAt: -1 })); } catch (error) { next(error); } }

// This lets a placement officer publish a short announcement.
// The frontend calls its text body, while the database stores message.
// Both names are accepted so the API remains straightforward to use.
export async function create(req, res, next) { try { const { title, message, body } = req.body; if (!title || !(message || body)) return res.status(400).json({ error: { message: "Title and message are required", status: 400 } }); res.status(201).json(await Announcement.create({ title, message: message || body, postedBy: req.session.user.id })); } catch (error) { next(error); } }

// This permanently removes one announcement selected by its id.
// A missing id returns 404 so the UI can refresh its stale list.
// Role protection is attached at the route level.
export async function remove(req, res, next) { try { if (!(await Announcement.findByIdAndDelete(req.params.id))) return res.status(404).json({ error: { message: "Announcement not found", status: 404 } }); res.json({ message: "Announcement deleted" }); } catch (error) { next(error); } }
