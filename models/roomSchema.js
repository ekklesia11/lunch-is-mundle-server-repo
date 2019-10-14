const mongoose = require("mongoose");
require("dotenv/config");

mongoose.connect(
  `mongodb+srv://${process.env.DB_CONNECTION_ID}:${process.env.DB_CONNECTION_KEY}@cluster0-dwpha.mongodb.net/test?retryWrites=true&w=majority`,
  { useNewUrlParser: true },
  () => {
    console.log("DB connected!");
  }
);

mongoose.set("useFindAndModify", false);

const roomSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  room_status: {
    type: String,
    default: "wait"
  },
  room_name: {
    type: String,
    required: true,
    unique: true
  },
  created_At: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: String,
    required: true
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  number_people_joined: {
    type: Number
  },
  vote_count: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      한식: 0,
      중국집: 0,
      일식: 0,
      양식: 0,
      분식: 0,
      햄버거: 0,
      도시락: 0,
      아시아음식: 0
    }
  },
  vote_result: {
    type: String,
    default: null
  },
  final_result: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
});

mongoose.set("useCreateIndex", true);

module.exports = mongoose.model("Room", roomSchema);
