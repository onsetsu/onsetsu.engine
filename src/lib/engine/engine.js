'use strict';

// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Circle = function Circle() {};

var Player = function Player() {};

var Team = function Team() {};

class IncrementalIDGenerator {
  constructor() {
    this.id = 1;
  }

  nextID() {
    return this.id++;
  }
}

var nextBattlefieldID = (function() {
  var generator = new IncrementalIDGenerator();
  return generator.nextID.bind(generator);
})();

class Mage {
  // TODO: separate owner and controller?
  constructor(player, hp, sp, delay, syllableBoard, spellBook, syllablePool) {
    this.id = nextBattlefieldID();
    this.controller = player;
    // TODO: add spellType Mage and SubTypes
    this.maxHp = hp;
    this.hp = hp;
    this.maxSp = sp;
    this.sp = sp;
    this.delay = delay;
    this.syllableBoard = syllableBoard;
    syllableBoard.mage = this;
    this.spellBook = spellBook;
    this.syllablePool = syllablePool;

    this.action = new Action({}, this.delay, Action.recurring, this);

    this.onBattlefield = false;
  }

  isOnBattlefield() {
    return this.onBattlefield;
  }

  putOntoBattlefield() {
    this.onBattlefield = true;
    game.battlefield.addMage(this);
    game.timeline.addAction(this.action);
  }

  removeFromBattlefield() {
    this.onBattlefield = false;
    game.timeline.removeAction(this.action);
    game.battlefield.removeMage(this);
  }
}

var Gem = function Gem() {};
