/**
 * Audio engine for game sounds
 */

export const Audio = {

  click() {
    new Audio("/sounds/click.mp3").play();
  },

  bet() {
    new Audio("/sounds/bet.mp3").play();
  },

  win() {
    new Audio("/sounds/win.mp3").play();
  },

  loss() {
    new Audio("/sounds/loss.mp3").play();
  },

  round(i) {
    new Audio("/sounds/round.mp3").play();
  },

  nearMiss() {
    new Audio("/sounds/nearmiss.mp3").play();
  }

};