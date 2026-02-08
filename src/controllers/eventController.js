const Event = require("../models/Event");
const User = require("../models/user");
const { sendEmail } = require("../services/emailService");

const buildMapUrl = (lat, lng) => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      date,
      location,
      price,
      capacity
    } = req.body;

    const mapUrl = buildMapUrl(
      location.coordinates.lat,
      location.coordinates.lng
    );

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const event = await Event.create({
      title,
      description,
      type,
      date,
      location: {
        ...location,
        mapUrl
      },
      price,
      capacity,
      imageUrl,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("participants.user", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.length >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    const alreadyRegistered = event.participants.some(
      (p) => p.user.toString() === userId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    event.participants.push({ user: userId });
    await event.save();

    const user = await User.findById(userId);

    await sendEmail({
      to: user.email,
      subject: "Event Registration Confirmation",
      html: `
        <h2>Registration Successful рџЋ‰</h2>
        <p>You have registered for:</p>
        <b>${event.title}</b>
        <p>Date: ${new Date(event.date).toLocaleString()}</p>
        <p>Location: ${event.location.address}, ${event.location.city}</p>
        <a href="${event.location.mapUrl}">Open on map</a>
      `
    });

    res.json({ message: "Successfully registered for event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unregisterFromEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.participants = event.participants.filter(
      (p) => p.user.toString() !== userId.toString()
    );

    await event.save();

    res.json({ message: "Successfully unregistered from event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
