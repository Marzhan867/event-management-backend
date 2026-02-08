const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["concert", "conference", "workshop", "meetup", "party", "event"],
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    location: {
      city: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      coordinates: {
        lat: Number,
        lng: Number
      },
      mapUrl: String
    },

    price: {
      type: Number,
      default: 0
    },

    capacity: {
      type: Number,
      required: true
    },

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        registeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "finished", "cancelled"],
      default: "upcoming"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    source: {
      type: String,
      default: "local"
    },
    externalId: {
      type: String
    },
    externalUrl: {
      type: String
    },
    imageUrl: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
