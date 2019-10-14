const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const roomRoute = require("../controller/routers");
const socket = require("socket.io");
const db = require("../models/db");
const axios = require("axios");
const qs = require("querystring");
const finalResult = require("./Algorithms");
require("dotenv/config");

const app = express();
const PORT = process.env.PORT || 5001;

// Server memory usage data
const voted_data = {};

app.use(cors());
app.use(bodyParser.json());

// Create router connection
app.use("/room", roomRoute);

const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT} ...`);
});

// Socket.io connection
const io = socket(server);

io.on("connection", socket => {
  socket.on("room", room => {
    socket.join(room);
  });

  // Server temporary data usage
  socket.on("vote", vote => {
    if (voted_data[vote.room_name] !== undefined) {
      voted_data[vote.room_name][vote.category] += 1;
    } else {
      voted_data[vote.room_name] = {
        한식: 0,
        중국집: 0,
        일식: 0,
        양식: 0,
        분식: 0,
        햄버거: 0,
        도시락: 0,
        아시아음식: 0
      };
    }

    socket.broadcast.to(vote.room_name).emit("vote", vote.category);
  });
});

// Actions according to four status: wait, ready, vote, result
app.get("/room/:room_name", async (req, res, next) => {
  try {
    // Status: wait
    let theRoom = await db.getByRoom_name(req.params.room_name).then(res => {
      if (res) {
        return res;
      }
    });

    let joined_num = theRoom.number_people_joined + 1;
    db.getByRoom_nameAndUpdatePeopleNumber(
      req.params.room_name,
      joined_num
    ).then(res => {
      io.sockets.in(req.params.room_name).emit("joined", joined_num);
    });

    // Status: ready
    if (joined_num === 2) {
      await db
        .getByRoom_nameAndUpdateRoom_Status(req.params.room_name, "ready")
        .then(res => {
          io.sockets.in(req.params.room_name).emit("status", "ready");
        });

      let count = 10;
      let countdown = setInterval(() => {
        io.sockets.in(req.params.room_name).emit("countdown", count);
        count--;

        // Status: vote
        if (count === -1) {
          clearInterval(countdown);
          db.getByRoom_nameAndUpdateRoom_Status(
            req.params.room_name,
            "vote"
          ).then(res => {
            io.sockets.in(req.params.room_name).emit("status", "vote");
            liveCountdown(15);
          });
        }
      }, 1000);
    }

    // Function for voting state containing result state
    const liveCountdown = second => {
      let count = second;
      let countdown = setInterval(() => {
        io.sockets.in(req.params.room_name).emit("countdown", count);
        count--;

        // Status: result
        if (count === -1) {
          clearInterval(countdown);
          db.getByRoom_nameAndUpdateRoom_Status(
            req.params.room_name,
            "result"
          ).then(async res => {
            try {
              io.sockets.in(req.params.room_name).emit("status", "result");

              await db.getByRoom_name(req.params.room_name).then(async res => {
                try {
                  if (voted_data[req.params.room_name] !== undefined) {
                    let newCategory = voted_data[req.params.room_name];
                    await db.getByRoom_nameAndUpdateCategory(
                      req.params.room_name,
                      newCategory
                    );
                  }

                  let roomStatus = await db
                    .getByRoom_name(req.params.room_name)
                    .then(res => {
                      return res;
                    });

                  let voted;
                  if (voted_data[req.params.room_name] === undefined) {
                    voted = roomStatus.vote_count;
                  } else {
                    voted = voted_data[req.params.room_name];
                  }

                  let category = finalResult(voted);
                  let query = qs.escape(category);
                  let location = roomStatus.location;
                  let KEY = "KakaoAK " + process.env.KAKAOMAP_API_KEY;
                  let radius = 500;
                  let mapUrl =
                    "https://dapi.kakao.com/v2/local/search/keyword.json";
                  let final_result = await axios({
                    method: "GET",
                    url: `${mapUrl}?y=${location.latitude}&x=${location.longitude}&radius=${radius}&query=${query}&sort=distance`,
                    headers: {
                      Authorization: KEY
                    }
                  }).then(res => res);

                  db.getByRoom_nameAndUpdateFinalResult(
                    req.params.room_name,
                    final_result.data.documents
                  ).then(res => {
                    db.getByRoom_nameAndUpdateVoteResult(
                      req.params.room_name,
                      category
                    ).then(res => res);

                    let totalResult = {
                      vote_result: category,
                      vote_count: voted_data[req.params.room_name]
                        ? voted_data[req.params.room_name][category]
                        : 0,
                      final_result: res.final_result
                    };

                    io.sockets
                      .in(req.params.room_name)
                      .emit("result", totalResult);
                  });
                } catch (err) {
                  return err;
                }
              });
            } catch (err) {
              return err;
            }
          });
        }
      }, 1000);
    };

    let roomStatus = await db.getByRoom_name(req.params.room_name).then(res => {
      return res;
    });

    let result = [];
    if (roomStatus.room_status === "result") {
      result = roomStatus.final_result;
    }

    res.status(200).json({
      joined_num: joined_num,
      status: roomStatus.room_status,
      vote_result: roomStatus.vote_result,
      final_result: result
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(404).send();
});
