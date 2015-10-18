'use strict';

// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Circle = function Circle() {};

var Player = function Player() {};

var Team = function Team() {};

// TODO: refactor to positiveUUIDGenerator (allow multiple nextIDs)
var nextID = (function() {
  var id = 1;
  return function() {
    return id++;
  };
})();

class Mage {
  // TODO: separate owner and controller?
  constructor(player, hp, sp, delay, syllableBoard, spellBook, syllablePool) {
    this.id = nextID();
    this.controller = player;
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

  receiveDamage(amount) {
    this.hp -= amount;
  }

  startTurn() {
    this.maxSp = Math.min(this.maxSp+1, 8);
    this.sp = this.maxSp;
  }
}

var Gem = function Gem() {};

// --------------------------------------------------------------------------------
// Stack
// --------------------------------------------------------------------------------

class Stack {
  constructor() {
    this.spells = [];
  }

  push(spell) {
    this.spells.push(spell);
  }

  pop() {
    return this.spells.shift();
  }

  empty() {
    return this.spells.length == 0;
  }

  process() {
    return new Promise(function(resolve, reject) {
      var popFirstIfNotEmpty = function() {
        if(game.stack.empty()) {
          console.log('Empty Stack');
          return resolve();
        }

        console.log('Non-empty Stack: Processing');
        console.log('Resolve Spell', spell);
        var spell = game.stack.pop();
        spell.effect(spell.mage).then(popFirstIfNotEmpty);
      };

      popFirstIfNotEmpty();
    });
  }
}

// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

class Game {
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

var Engine = function Engine() {};
