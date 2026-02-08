const express = require("express");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const externalRoutes = require("./routes/externalRoutes");
const contactRoutes = require("./routes/contactRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/contact", contactRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));
app.use("/uploads", express.static(path.join(frontendPath, "assets", "uploads")));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});



app.use(errorMiddleware);

module.exports = app;
