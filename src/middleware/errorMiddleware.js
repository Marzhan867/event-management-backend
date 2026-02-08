const ApiError = require("../utils/apiError");

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  if (err.isJoi) {
    return res.status(400).json({
      message: "Validation error",
      details: err.details.map(d => d.message)
    });
  }

  res.status(500).json({
    message: "Internal Server Error"
  });
};

module.exports = errorMiddleware;
