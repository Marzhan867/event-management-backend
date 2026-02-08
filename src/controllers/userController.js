exports.getProfile = (req, res) => {
  res.json(req.user);
};

const Event = require("../models/Event");

// GET MY REGISTERED EVENTS
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const events = await Event.find({
      "participants.user": userId
    })
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EVENTS CREATED BY ME (ORGANIZER)
exports.getCreatedEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const User = require("../models/user");

// ADD TO FAVORITES
exports.addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.id;

    if (user.favorites.includes(eventId)) {
      return res.status(400).json({ message: "Event already in favorites" });
    }

    user.favorites.push(eventId);
    await user.save();

    res.json({ message: "Event added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE FROM FAVORITES
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.id;

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== eventId
    );
    await user.save();

    res.json({ message: "Event removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FAVORITES
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
