const ApiError = require("../utils/apiError");

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Егер біз өз ApiError қолдансақ
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  // Joi validation error (кейін керек болады)
  if (err.isJoi) {
    return res.status(400).json({
      message: "Validation error",
      details: err.details.map(d => d.message)
    });
  }

  // Default error
  res.status(500).json({
    message: "Internal Server Error"
  });
};

module.exports = errorMiddleware;
