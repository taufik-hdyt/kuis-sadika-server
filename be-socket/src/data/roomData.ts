import { UserDataType } from "./userData";

export type AnswersType = {
  answer: string;
};

export type RoomUserType = {
  user: UserDataType;
  answer: AnswersType[];
  currentQuestion: number;
  score: number;
};

export type RoomType = {
  players: RoomUserType[];
  roomId: string;
};

class RoomsData {
  private _rooms: RoomType[];

  constructor() {
    this._rooms = [];
  }

  get activeRooms(): RoomType[] {
    return this._rooms;
  }

  getRoom(roomId: string): RoomType {
    return this._rooms.filter((room) => {
      return room.roomId === roomId;
    })[0];
  }

  checkRoom(roomId: string): boolean {
    return Boolean(this._rooms.filter((room) => room.roomId === roomId).length);
  }

  addRoom(room: RoomType) {
    this._rooms.push(room);
  }

  deleteRoom(roomId: string) {
    this._rooms = this._rooms.filter((room) => room.roomId !== roomId);
  }

  changeScore(userId: string, roomId: string, score: number, answer: string) {
    console.log(score, answer);
    this._rooms = this._rooms.map((room) => {
      if (room.roomId === roomId) {
        console.log("babi");
        return {
          ...room,
          players: room.players.map((user) => {
            if (user.user.userId === userId) {
              return {
                ...user,
                answer: [...user.answer, { answer }],
                score: score,
              };
            }
            return user;
          }),
        };
      }
      return room;
    });
    // console.log(this.getRoom(roomId).players);
  }
}

export default RoomsData;
