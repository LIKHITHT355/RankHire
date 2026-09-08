// This checks for the user object saved in the cookie session.
// Routes that use it are private and cannot run for visitors.
// The error format stays the same across the whole API.
export function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: { message: "Not authenticated", status: 401 } });
  next();
}
