import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./message";
import { Game } from "./game";

// we need a class for Game, Users

export class GameManager {
  // in memory games object which will maintain the state of currently playing games b/w two browsers
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    // should have a reconnect logic

    this.users = this.users.filter((user) => user !== socket);
  }

  private addHandler(socket: WebSocket) {
    // probably use grpc here
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          // start a game
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          // add the user to the pending state
          this.pendingUser = socket;
        }
      }

      if (message.type === MOVE) {
        // i make the player public but use different logic to find the current game

        // try to find a game with an easy method

        const game = this.games.find(
          (game) => game.player1 === socket || game.player2 === socket
        );

        if (game) {
          game.makeMove(socket, message.payload.move);
        }
      }
    });
  }
}
