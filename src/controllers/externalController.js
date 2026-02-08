const Event = require("../models/Event");
const { fetchTicketmasterEvents } = require("../services/ticketmasterService");

const normalizeType = (type) => {
  const allowed = ["concert", "conference", "workshop", "meetup", "party", "event"];
  return allowed.includes(type) ? type : "event";
};

exports.importTicketmaster = async (req, res) => {
  try {
    const apiKey = process.env.TICKETMASTER_KEY;
    if (!apiKey) {
      return res.status(400).json({ message: "Ticketmaster API key is missing" });
    }

    const country = req.body.country || "US";
    const city = req.body.city || "";
    const size = Number(req.body.size || 150);

    const events = await fetchTicketmasterEvents({
      apiKey,
      country,
      city,
      size,
    });

    let created = 0;
    let updated = 0;

    for (const item of events) {
      const existing = await Event.findOne({
        source: "ticketmaster",
        externalId: item._id,
      });

      const payload = {
        title: item.title,
        description: item.description || "External event",
        type: normalizeType(item.type),
        date: item.date,
        location: {
          city: item.location?.city || "TBA",
          address: item.location?.address || "TBA",
          coordinates: {
            lat: item.location?.coordinates?.lat ?? null,
            lng: item.location?.coordinates?.lng ?? null,
          },
          mapUrl: item.location?.mapUrl || "",
        },
        price: typeof item.price === "number" ? item.price : 0,
        capacity: 1000,
        createdBy: req.user._id,
        source: "ticketmaster",
        externalId: item._id,
        externalUrl: item.location?.mapUrl || "",
        imageUrl: item.imageUrl || "",
      };

      if (!existing) {
        await Event.create(payload);
        created += 1;
      } else {
        await Event.updateOne({ _id: existing._id }, payload);
        updated += 1;
      }
    }

    res.json({ created, updated, total: events.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
