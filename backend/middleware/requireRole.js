// This creates a middleware check for one or more allowed roles.
// It reads the role from the trusted server-side session.
// Users outside the allowed roles receive a clear forbidden error.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session?.user?.role)) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } });
    next();
  };
}
