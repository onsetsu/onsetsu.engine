// --------------------------------------------------------------------------------
// General
// --------------------------------------------------------------------------------

var Circle = function Circle() {};

var Player = function Player() {};

var Team = function Team() {};

// TODO: separate owner and controller?
var Mage = function Mage(player, hp, sp, syllableBoard, spellBook, syllablePool) {
  this.controller = player;
  this.hp = hp;
  this.maxSp = sp;
  this.sp = sp;
  this.syllableBoard = syllableBoard;
  syllableBoard.mage = this;
  this.spellBook = spellBook;
  this.syllablePool = syllablePool;
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
