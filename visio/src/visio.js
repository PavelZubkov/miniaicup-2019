/* global window */
const mockGame = {
  config: {
    "1": "46707",
    "5": "48193",
    "3": "48035",
    "4": "48173",
    "2": "47903",
    "6": "48196"
  },
  visio_info: [
    {
      type: "start_game",
      x_cells_count: 31,
      y_cells_count: 31,
      speed: 5,
      width: 30
    },
    {
      type: "tick",
      players: {
        "1": {
          score: 0,
          direction: null,
          territory: [
            [165, 255],
            [135, 225],
            [195, 225],
            [195, 255],
            [135, 255],
            [195, 285],
            [165, 225],
            [135, 285],
            [165, 285]
          ],
          lines: [],
          position: [165, 255],
          bonuses: []
        },
        "2": {
          score: 0,
          direction: null,
          territory: [
            [135, 675],
            [195, 675],
            [165, 645],
            [135, 705],
            [195, 705],
            [195, 645],
            [135, 645],
            [165, 705],
            [165, 675]
          ],
          lines: [],
          position: [165, 675],
          bonuses: []
        },
        "3": {
          score: 0,
          direction: null,
          territory: [
            [495, 795],
            [435, 735],
            [435, 765],
            [465, 765],
            [435, 795],
            [495, 735],
            [465, 735],
            [495, 765],
            [465, 795]
          ],
          lines: [],
          position: [465, 765],
          bonuses: []
        },
        "4": {
          score: 0,
          direction: null,
          territory: [
            [465, 165],
            [465, 135],
            [495, 195],
            [435, 135],
            [435, 165],
            [465, 195],
            [435, 195],
            [495, 135],
            [495, 165]
          ],
          lines: [],
          position: [465, 165],
          bonuses: []
        },
        "5": {
          score: 0,
          direction: null,
          territory: [
            [735, 285],
            [795, 225],
            [765, 285],
            [735, 225],
            [765, 255],
            [765, 225],
            [795, 255],
            [735, 255],
            [795, 285]
          ],
          lines: [],
          position: [765, 255],
          bonuses: []
        },
        "6": {
          score: 0,
          direction: null,
          territory: [
            [795, 705],
            [795, 675],
            [735, 645],
            [795, 645],
            [765, 705],
            [765, 675],
            [735, 675],
            [765, 645],
            [735, 705]
          ],
          lines: [],
          position: [765, 675],
          bonuses: []
        }
      },
      bonuses: [],
      tick_num: 1,
      saw: []
    }
  ]
};

const IO = class {
  getConfig() {
    return mockGame.visio_info[0];
  }

  getNextTickData() {
    return mockGame.visio_info[1];
  }
};

const main = () => {};

window.addEventListener("load", main);
