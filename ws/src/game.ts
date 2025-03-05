import { WebSocket } from "ws";
import { Chess, Square } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message";

// This is the file which will define the types of the games array object

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  // can be represented as a string and also as a 2 dimensional array of strings
  private board: Chess;
  private startTime: Date;
  private moveCount: number;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.moveCount = 0;

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
        },
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // 1.  validations
    // use zod to validate the move
    // 2. is it the users move
    // 2. is the move valid

    // TODO: TIME LOGIC IS MISSING FROM HERE

    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      return;
    } else if (this.moveCount % 2 === 1 && socket !== this.player2) {
      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.log(error);
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
    }

    if (this.moveCount % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }

    this.moveCount++;
    // update the board
    // push the game
    // check if the game is over
    // send the updated board to both the players
  }
}
