// models/Course.js
"use strict";

const mongoose = require("mongoose"),
  musicSchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
      },
      genre: {
        type: String,
        required: true,
      },
      singer: {
        type: String,
        required: true,
      },
      songlength: {
        type: Number,
        default: 0,
        min: [0, "0 is not"],
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model("Music", musicSchema);
