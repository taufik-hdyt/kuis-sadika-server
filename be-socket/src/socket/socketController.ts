import { Server, Socket } from "socket.io";
import UsersData, { UserDataType } from "../data/userData";
import RoomsData, { RoomUserType } from "../data/roomData";

function createUniqueID(roomOrUser: string) {
  return roomOrUser + Math.random().toString(36).substring(2, 15);
}

const PLAYER_PER_MATCH = 3;
const QUESTION_PER_MATCH = 3;
const usersWaiting = new UsersData();
const rooms = new RoomsData();

let StartTimer: NodeJS.Timeout | undefined = undefined;

interface roomNumberType {
  [key: string]: number;
}
interface roomTimeout {
  [key: string]: NodeJS.Timeout | undefined;
}
const roomTime: roomNumberType = {};
const roomTimers: roomTimeout = {};

export default function socketController(io: Server, socket: Socket) {
  socket.on("matchmaking", async ({ userId, userName, userAvatar }) => {
    if (!usersWaiting.checkUser(userId)) {
      usersWaiting.addUser({
        userId: createUniqueID("user_"),
        userName,
        userAvatar,
        socket,
      });
      console.log(`New player with ID ${socket.id} joined the matchmaking`);

      userWaitingInfo();
      userWaitingListUpdate();

      if (StartTimer === undefined) {
        let time = 30;
        StartTimer = setInterval(async () => {
          usersWaiting.allUser.forEach((user: UserDataType) => {
            user.socket.emit("findingMatchCountdown", {
              message: `Finding Opponents in ${time} seconds`,
              time,
            });
          });

          if (time === 0) {
            if (StartTimer) clearInterval(StartTimer);
            StartTimer = undefined;
            matchStart(io);
          }
          time--;
        }, 1000);
      }

      if (usersWaiting.allUser.length >= PLAYER_PER_MATCH) {
        if (StartTimer) clearInterval(StartTimer);
        StartTimer = undefined;

        matchStart(io);
      }
    }

    socket.on("addScore", ({ userId, roomId, answer, score }) => {
      console.log(`an answer added by ${userId}`);
      if (rooms.checkRoom(roomId)) {
        rooms.changeScore(userId, roomId, score, answer);
      }
    });

    socket.on("cancelMatchmaking", () => {
      usersWaiting.removeUser(socket.id);
      console.log(`user ${socket.id} leave the matchmaking`);

      if (usersWaiting.allUser.length === 0) {
        if (StartTimer) clearInterval(StartTimer);
        StartTimer = undefined;
      }

      userWaitingInfo();
      userWaitingListUpdate();
    });

    socket.on("disconnect", () => {
      usersWaiting.removeUser(socket.id);
      console.log(`user ${socket.id} disconnected`);

      if (usersWaiting.allUser.length === 0) {
        if (StartTimer) clearInterval(StartTimer);
        StartTimer = undefined;
      }

      userWaitingInfo();
      userWaitingListUpdate();
    });
  });
}

// start finding match log
function userWaitingListUpdate() {
  usersWaiting.allUser.forEach((user: UserDataType) => {
    user.socket.emit("findingMatch", {
      message: "Finding Opponents 😀",
      opponentsInMatchmaking: usersWaiting.allUser.map(
        (user: UserDataType) => ({
          userId: user.userId,
          userName: user.userName,
          userAvatar: user.userAvatar,
        })
      ),
    });
  });
}

// Ongoing matchmaking logs
function userWaitingInfo() {
  console.log(
    "users waiting for match",
    usersWaiting.allUser.map((user) => `${user.userId} - ${user.userName}`)
  );
}

function matchStart(io: Server) {
  const roomID = createUniqueID("room_");
  console.log("room created", roomID);
  const playerSelectedToMatch = usersWaiting.allUser.splice(
    0,
    PLAYER_PER_MATCH
  );

  rooms.addRoom({
    roomId: roomID,
    players: playerSelectedToMatch.map((player) => ({
      user: player,
      score: 0,
      currentQuestion: 0,
      answer: [],
    })),
  });

  playerSelectedToMatch.forEach((user: UserDataType) => {
    user.socket.join(roomID);
    user.socket.emit("matchFound", {
      message: "Match Found",
      roomID,
      questions: [
        {
          id: 1,
          answer: "Tenaga",
          question:
            "Di rumah makan padang, selain pakai sendok kita makan pakai?",
        },
        {
          id: 2,
          answer: "Celana",
          question:
            "Selain mobil, bus atau pesawat, orang pergi dari Jakarta ke Surabaya biasanya menggunakan?",
        },
        {
          id: 3,
          answer: "Tolong",
          question:
            "Biasa digunakan untuk menyalakan atau mematikan TV dan AC?",
        },
      ],
    });
  });

  roomTime[roomID] = 95;

  // Update the room session timer every second
  roomTimers[roomID] = setInterval(() => {
    roomTime[roomID]--;

    io.to(roomID).emit("roomSessionCountdown", {
      time: roomTime[roomID],
    });

    // Check if the time has run out to set the next timer
    if (roomTime[roomID] === 0) {
      clearInterval(roomTimers[roomID]);

      io.to(roomID).emit("matchOver", {
        message: "Its Joever",
        finalResult: rooms
          .getRoom(roomID)
          .players.map((player: RoomUserType) => {
            return {
              userId: player.user.userId,
              userName: player.user.userName,
              userAvatar: player.user.userAvatar,
              score: player.score,
              answer: player.answer,
            };
          }),
      });

      // Delete the room
      rooms.deleteRoom(roomID);
    }
  }, 1000);
}
