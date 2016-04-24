'use strict';

import { ONS_EventManager } from './engineeffect.js';
import Stack from './stack.js';

export class Game {
  constructor() {
    this.players = [];
    this.battlefield = new Battlefield();
    this.timeline = new Timeline();
    this.stack = new Stack();
    this.eventManager = new ONS_EventManager();
  }

  addPlayer(player) {
    this.players.push(player);
    this.battlefield.addPlayer(player);
  }
}
