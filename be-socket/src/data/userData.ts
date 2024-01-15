import { Socket } from "socket.io";

export type UserDataType = {
  userId: string;
  userName: string;
  userAvatar: string;
  socket: Socket;
};

class UsersData {
  private _users: UserDataType[];

  constructor() {
    this._users = [];
  }

  get allUser(): UserDataType[] {
    return this._users;
  }

  checkUser(userId: string): boolean {
    return Boolean(this._users.filter((user) => user.userId === userId).length);
  }

  addUser(user: UserDataType) {
    this._users.push(user);
  }

  removeUser(socketId: string) {
    this._users = this._users.filter((user) => user.socket.id !== socketId);
  }
}

export default UsersData;
