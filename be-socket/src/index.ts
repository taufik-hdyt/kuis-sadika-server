import express from "express";
import { createServer } from "http";
import { Server, Socket as IOSocket } from "socket.io";

const port = 4000;

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

interface UserInfo {
  id: string | null;
  name: string | null;
}

interface CustomSocket extends IOSocket {
  room?: string;
  answered?: boolean;
  userInfo?: UserInfo;
}

interface UserInfo {
  id: string | null;
  name: string | null;
}

interface Player {
  socketId: string;
  userInfo: UserInfo;
  score?: number;
  answered?: boolean;
}

interface Room {
  players: Player[];
  timer: number;
  timerInterval?: NodeJS.Timeout;
  questionTimer?: number;
  questionTimerInterval?: NodeJS.Timeout;
  currentQuestionIndex?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentQuestion?: any; // Type for question object
}

const questions = [
  {
    id: 1,
    answer: "Tenaga",
    question: "Di rumah makan padang, selain pakai sendok kita makan pakai?",
    created_at: "2023-11-13T00:00:00.000000Z",
    updated_at: "2023-11-14T03:38:38.000000Z",
  },
  {
    id: 2,
    answer: "Celana",
    question:
      "Selain mobil, bus atau pesawat, orang pergi dari Jakarta ke Surabaya biasanya menggunakan?",
    created_at: "2023-11-13T00:00:00.000000Z",
    updated_at: "2023-11-13T00:00:00.000000Z",
  },
  {
    id: 3,
    answer: "Tolong",
    question: "Biasa digunakan untuk menyalakan atau mematikan TV dan AC?",
    created_at: "2023-11-13T00:00:00.000000Z",
    updated_at: "2023-11-13T00:00:00.000000Z",
  },
  {
    id: 4,
    answer: "Noleh",
    question: "Seseorang yang memimpin sebuah desa, biasanya dipanggil pak?",
    created_at: "2023-11-13T00:00:00.000000Z",
    updated_at: "2023-11-13T00:00:00.000000Z",
  },
  {
    id: 5,
    answer: "Telan",
    question: "Senikmat-nikmatnya makan diluar lebih nikmat makan di?",
    created_at: "2023-11-13T00:00:00.000000Z",
    updated_at: "2023-11-13T00:00:00.000000Z",
  },
];

const MAX_PLAYERS_PER_ROOM = 5;
const MAX_ROUNDS = 5;
const rooms: Record<
  string,
  Room & { currentRound: number; gameInProgress: boolean }
> = {};

const startTimer = (room: string, duration: number, callback: () => void) => {
  const currentRoom = rooms[room];

  if (!currentRoom) {
    console.error(`Room ${room} not found.`);
    return;
  }

  if (currentRoom.timerInterval) {
    clearInterval(currentRoom.timerInterval);
  }

  currentRoom.timer = duration;

  currentRoom.timerInterval = setInterval(() => {
    currentRoom.timer = Math.max(0, currentRoom.timer - 1);
    io.to(room).emit("timerUpdate", { timer: currentRoom.timer });

    if (currentRoom.timer === 0) {
      clearInterval(currentRoom.timerInterval);
      currentRoom.timerInterval = undefined;
      callback();

      // Set gameInProgress to false when timer reaches 0
      currentRoom.gameInProgress = false;
      io.to(room).emit("gameEnded");
    }
  }, 1000);
};

const resetGame = (room: string) => {
  try {
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        timer: 30,
        currentRound: 1,
        gameInProgress: true,
      };
    }

    if (rooms[room].currentRound <= MAX_ROUNDS && rooms[room].gameInProgress) {
      startQuestionRound(room);
    } else {
      rooms[room].gameInProgress = false;
      showFinalScores(room);
    }
  } catch (error) {
    console.error("Error in resetGame:", error);
  }
};

const startQuestionRound = (room: string) => {
  const currentRoom = rooms[room];

  currentRoom.currentQuestionIndex =
    (currentRoom.currentQuestionIndex || 0) + 1;

  if (currentRoom.currentQuestionIndex < questions.length) {
    const randomQuestion = questions[currentRoom.currentQuestionIndex];

    currentRoom.currentQuestion = randomQuestion;
    currentRoom.questionTimer = 30;

    io.to(room).emit("newQuestion", { question: randomQuestion.question });

    startTimer(room, 30, () => {
      clearInterval(currentRoom.questionTimerInterval);
      currentRoom.questionTimerInterval = undefined;

      if (currentRoom.currentRound <= MAX_ROUNDS) {
        rooms[room].gameInProgress = true;
        rooms[room].currentRound += 1;
        startQuestionRound(room);
      } else {
        showFinalScores(room);
      }
    });

    currentRoom.questionTimerInterval = setInterval(() => {
      if (typeof currentRoom.questionTimer !== "undefined") {
        currentRoom.questionTimer = Math.max(0, currentRoom.questionTimer - 1);
        io.to(room).emit("questionTimer", { timer: currentRoom.questionTimer });

        if (currentRoom.questionTimer === 0) {
          clearInterval(currentRoom.questionTimerInterval);
          currentRoom.questionTimerInterval = undefined;
          io.to(room).emit("questionTimerZero");

          if (currentRoom.currentQuestionIndex === questions.length - 1) {
            showFinalScores(room);
          } else {
            startQuestionRound(room);
          }
        }
      }
    }, 1000);
  } else {
    showFinalScores(room);
  }
};

const showFinalScores = (room: string) => {
  const finalScores = rooms[room].players.map((player) => ({
    socketId: player.socketId,
    userInfo: player.userInfo,
    score: player.score || 0,
  }));

  io.to(room).emit("displayFinalScores", { players: finalScores });

  setTimeout(() => {
    resetGame(room);
  }, 10000);
};

const startWaitingState = (room: string) => {
  const currentRoom = rooms[room];
  const answeredPlayers = currentRoom.players.filter(
    (player) => player.answered
  );

  if (
    answeredPlayers.length === currentRoom.players.length ||
    currentRoom.questionTimer === 0
  ) {
    io.to(room).emit("displayScores", { players: currentRoom.players });
    io.to(room).emit("scoresDisplayed");
    currentRoom.players.forEach((player) => {
      const isCorrect = player.answered && player.score! > 0;
      const response = isCorrect ? "benar" : "salah";
      io.to(player.socketId).emit("answerResponse", { response });
    });

    setTimeout(() => {
      startQuestionRound(room);
    }, 5000);
  }
};

io.on("connection", (socket: CustomSocket) => {
  console.log(`a user connected with ID ${socket.id}`);

  socket.on("setUserInfo", ({ id, name }) => {
    socket.userInfo = { id, name };
    socket.answered = false;
  });

  socket.on("answer", ({ room, answer, userId }) => {
    const currentRoom = rooms[room];
    const isCorrect =
      answer.toLowerCase() === currentRoom.currentQuestion.answer.toLowerCase();

    if (isCorrect) {
      const answeringPlayer = currentRoom.players.find(
        (player) => player.userInfo.id === userId
      );
      if (answeringPlayer) {
        answeringPlayer.score = (answeringPlayer.score || 0) + 1;
      }
    }

    socket.answered = true;

    io.to(room).emit("updateScores", { players: currentRoom.players });

    startWaitingState(room);
  });

  socket.on("questionTimerZero", () => {
    const currentRoom = socket.room ? rooms[socket.room] : undefined;

    if (currentRoom) {
      clearInterval(currentRoom.questionTimerInterval);
      currentRoom.questionTimerInterval = undefined;

      if (socket.room) {
        io.to(socket.room).emit("displayScores", {
          players: currentRoom.players,
        });

        setTimeout(() => {
          if (socket.room) {
            startQuestionRound(socket.room);
          }
        }, 5000);
      }
    }
  });

  socket.on("matchmaking", () => {
    let room: string | undefined;
    for (const roomId in rooms) {
      if (
        rooms[roomId].players.length < MAX_PLAYERS_PER_ROOM &&
        rooms[roomId].gameInProgress
      ) {
        room = roomId;
        break;
      }
    }

    if (!room) {
      room = "room-" + Date.now().toString();
      rooms[room] = {
        players: [],
        timer: 30,
        currentRound: 1,
        gameInProgress: true,
      };
    }

    if (room) {
      socket.join(room);
      socket.room = room;
      rooms[room].players.push({
        socketId: socket.id,
        userInfo: socket.userInfo || { id: null, name: null },
      });

      console.log(`User ${socket.id} joined room ${room}`);
      io.to(room).emit("matchmakingSuccess", {
        room,
        players: rooms[room].players,
        timer: rooms[room].timer,
        gameInProgress: rooms[room].gameInProgress,
      });

      console.log("matchmaking success", {
        room,
        players: rooms[room].players,
        timer: rooms[room].timer,
        gameInProgress: rooms[room].gameInProgress,
      });

      startTimer(room, rooms[room].timer, () => {
        if (room) {
          resetGame(room);
        }
      });
    }

    socket.on("disconnect", () => {
      if (socket.room) {
        const currentRoom = rooms[socket.room];

        const index = currentRoom.players.findIndex(
          (player) => player.socketId === socket.id
        );
        if (index !== -1) {
          currentRoom.players.splice(index, 1);
          console.log(`User ${socket.id} left room ${socket.room}`);
          io.to(socket.room).emit("playerLeft", {
            room: socket.room,
            players: currentRoom.players,
          });
          if (currentRoom.players.length === 0) {
            delete rooms[socket.room];
          }
        }
      }
    });
  });
});
