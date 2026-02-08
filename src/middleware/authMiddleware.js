const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/apiError");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Not authorized");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user; // ⬅️ МАҢЫЗДЫ (role осында)
    next();
  } catch (error) {
    next(error); // ⬅️ errorMiddleware-ке жібереді
  }
};

module.exports = authMiddleware;
