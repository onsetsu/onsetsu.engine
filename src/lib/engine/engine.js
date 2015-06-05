// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Circle = function Circle() {};

var Player = function Player() {};

var Team = function Team() {};

var nextID = (function() {
  var id = 1;
  return function() {
    return id++;
  };
})();

// TODO: separate owner and controller?
var Mage = function Mage(player, hp, sp, delay, syllableBoard, spellBook, syllablePool) {
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

  this.action = new Action({
    execute: this.takeTurn.bind(this)
  }, this.delay, Action.recurring, this);

  this.onBattlefield = false;
};

Mage.prototype.isOnBattlefield = function() {
  return this.onBattlefield;
};

Mage.prototype.putOntoBattlefield = function() {
  this.onBattlefield = true;
  game.battlefield.addMage(this);
  game.timeline.addAction(this.action);
};

Mage.prototype.removeFromBattlefield = function() {
  this.onBattlefield = false;
  game.timeline.removeAction(this.action);
  game.battlefield.removeMage(this);
};

Mage.prototype.takeTurn = function() {
  console.log('MAGE TURN!');
};

Mage.prototype.receiveDamage = function(amount) {
  this.hp -= amount;
};

var Gem = function Gem() {};

// --------------------------------------------------------------------------------
// Stack
// --------------------------------------------------------------------------------

var Stack = function Stack() {
  this.spells = [];
};

Stack.prototype.push = function(spell) {
  this.spells.push(spell);
};

Stack.prototype.pop = function() {
  return this.spells.shift();
};

Stack.prototype.empty = function() {
  return this.spells.length == 0;
};

Stack.prototype.process = function() {
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
};

// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Game = function Game() {
  this.players = [];
  this.battlefield = new Battlefield();
  this.timeline = new Timeline();
  this.stack = new Stack();
};
Game.prototype.addPlayer = function(player) {
  this.players.push(player);
  this.battlefield.addPlayer(player);
};

var Engine = function Engine() {};
