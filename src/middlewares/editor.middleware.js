const editorMiddleware = (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const allowedRoles = ["admin", "editor"];

  if (!allowedRoles.includes(req.authUser.role)) {
    return res.status(403).json({
      message: "Admin & editor access only",
    });
  }

  next();
};

module.exports = editorMiddleware;
