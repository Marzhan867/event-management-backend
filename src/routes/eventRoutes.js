const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createEventSchema } = require("../validations/eventValidation");
const multer = require("multer");
const path = require("path");

const {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  deleteEvent
} = require("../controllers/eventController");

const uploadDir = path.join(__dirname, "..", "frontend", "assets", "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

const normalizeEventBody = (req, res, next) => {
  const {
    city,
    address,
    lat,
    lng,
    price,
    capacity,
    ...rest
  } = req.body;

  req.body = {
    ...rest,
    price: price !== undefined ? Number(price) : price,
    capacity: capacity !== undefined ? Number(capacity) : capacity,
    location: {
      city,
      address,
      coordinates: {
        lat: lat !== undefined ? Number(lat) : lat,
        lng: lng !== undefined ? Number(lng) : lng,
      },
    },
  };

  next();
};

// get all events
router.get("/", getEvents);

// get single event by id
router.get("/:id", getEventById);


// CREATE EVENT
// only organizer or admin can create events
router.post(
  "/",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  upload.single("image"),
  normalizeEventBody,
  validate(createEventSchema),
  createEvent
);

// REGISTER FOR EVENT
// any authenticated user
router.post(
  "/:id/register",
  authMiddleware,
  registerForEvent
);

// IMPORT EXTERNAL EVENT

// IMPORT EXTERNAL EVENT + REGISTER
// UNREGISTER FROM EVENT 
router.delete(
  "/:id/register",
  authMiddleware,
  unregisterFromEvent
);

// DELETE EVENT
// only organizer/admin and owner
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  deleteEvent
);

module.exports = router;
