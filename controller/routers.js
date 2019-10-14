const express = require("express");
const router = express.Router();
const db = require("../models/db");
const crypto = require("crypto");

// create room
router.post("/create", (req, res) => {
  let random = Math.random().toString();
  let room_name = crypto
    .createHash("sha1")
    .update(random)
    .digest("hex")
    .slice(0, 5);
  let newRoom = {
    room_name: room_name,
    creator: room_name,
    location: req.body.location,
    number_people_joined: 0
  };
  db.saveRoomData(newRoom);
  res.status(200).json(room_name);
});

module.exports = router;
