const Room = require("../models/roomSchema");

module.exports = {
  saveRoomData: data => {
    const room = new Room({
      room_name: data.room_name,
      creator: data.creator,
      location: data.location,
      number_people_joined: data.number_people_joined
    });

    room.save().catch(err => {
      console.error(err);
    });
  },
  getByRoom_name: room => {
    return Room.findOne({
      room_name: room
    });
  },
  getByRoom_nameAndUpdatePeopleNumber: (room, addOne) => {
    return Room.findOneAndUpdate(
      {
        room_name: room
      },
      { $set: { number_people_joined: addOne } },
      { new: true }
    );
  },
  getByRoom_nameAndUpdateCategory: (room, category) => {
    Room.findOne({
      room_name: room
    }).then(theRoom => {
      theRoom.vote_count = category;

      theRoom.save().catch(err => console.error(err));
    });
  },
  getByRoom_nameAndUpdateRoom_Status: (room, status) => {
    return Room.findOneAndUpdate(
      {
        room_name: room
      },
      { $set: { room_status: status } },
      { new: true }
    );
  },
  getByRoom_nameAndUpdateFinalResult: (room, list) => {
    return Room.findOne({
      room_name: room
    }).then(theRoom => {
      theRoom.final_result = list;

      return theRoom.save().catch(err => console.error(err));
    });
  },
  getByRoom_nameAndUpdateVoteResult: (room, vote_result) => {
    return Room.findOneAndUpdate(
      {
        room_name: room
      },
      { $set: { vote_result: vote_result } },
      { new: true }
    );
  }
};
