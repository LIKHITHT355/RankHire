import bcrypt from "bcrypt";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import CompanyProfile from "../models/CompanyProfile.js";

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });
const fail = (res, status, message) => res.status(status).json({ error: { message, status } });

// This reports the account currently stored in the browser session.
// It never sends a password hash or any secret account field.
// Visitors get a clear 401 response which the frontend can handle.
export function session(req, res) {
  if (!req.session.user) return fail(res, 401, "Not authenticated");
  res.json(req.session.user);
}

// This creates an account and a matching blank role profile if needed.
// Passwords are converted to a bcrypt hash before MongoDB sees them.
// The new account is also logged in immediately through its session.
export async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !["student", "tpo", "company"].includes(role)) return fail(res, 400, "Name, email, password and a valid role are required");
    if (password.length < 6) return fail(res, 400, "Password must contain at least 6 characters");
    if (await User.exists({ email: email.toLowerCase() })) return fail(res, 400, "An account already uses this email");
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role });
    if (role === "student") await StudentProfile.create({ user: user._id });
    if (role === "company") await CompanyProfile.create({ user: user._id, companyName: name });
    req.session.user = publicUser(user);
    res.status(201).json(req.session.user);
  } catch (error) { next(error); }
}

// This verifies a login without ever comparing or returning plain passwords.
// Role is checked too because the login page sends the intended portal role.
// A successful match replaces the browser's old session user safely.
export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return fail(res, 400, "Email and password are required");
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)) || (role && role !== user.role)) return fail(res, 401, "Invalid email or password");
    req.session.user = publicUser(user);
    res.json(req.session.user);
  } catch (error) { next(error); }
}

// This removes the stored session and clears its browser cookie.
// Destroying the server session means an old cookie cannot be reused.
// A simple success object keeps the response easy for clients to read.
export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("rankhire.sid");
    res.json({ message: "Logged out" });
  });
}
