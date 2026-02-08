const ApiError = require("../utils/apiError");

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Access denied");
    }
    next();
  };
};

module.exports = roleMiddleware;
