const express = require("express");
const { fetchEventbriteEvents } = require("../services/eventbriteService");
const { fetchTicketmasterEvents } = require("../services/ticketmasterService");
const { importTicketmaster } = require("../controllers/externalController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/eventbrite", async (req, res) => {
  try {
    const city = req.query.city || "Astana";
    const token = process.env.EVENTBRITE_TOKEN;
    const organizationId = process.env.EVENTBRITE_ORG_ID;

    if (!token || !organizationId) {
      return res.status(400).json({
        message: "Eventbrite token or organization ID is missing"
      });
    }

    const events = await fetchEventbriteEvents({
      token,
      organizationId,
      city
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/ticketmaster", async (req, res) => {
  try {
    const city = req.query.city || "Astana";
    const country = req.query.country || "US";
    const size = Number(req.query.size || 20);
    const startDateTime = req.query.startDateTime || "";
    const endDateTime = req.query.endDateTime || "";
    const apiKey = process.env.TICKETMASTER_KEY;

    if (!apiKey) {
      return res.status(400).json({
        message: "Ticketmaster API key is missing"
      });
    }

    const events = await fetchTicketmasterEvents({
      apiKey,
      city,
      country,
      size,
      startDateTime,
      endDateTime
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/ticketmaster/import",
  authMiddleware,
  roleMiddleware("organizer", "admin"),
  importTicketmaster
);

module.exports = router;
