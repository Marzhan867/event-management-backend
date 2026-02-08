const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user"
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);