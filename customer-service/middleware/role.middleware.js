const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
