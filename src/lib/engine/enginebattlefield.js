// --------------------------------------------------------------------------------
// Battlefield
// --------------------------------------------------------------------------------

var FieldSide = function(player) {
  this.player = player;
  this.mages = [];
  this.permanents = [];
};

var Zone = function Zone() {};

var Battlefield = function Battlefield() {
  this.sides = [];
};
Battlefield.prototype.addPlayer = function(player) {
  this.sides.push(new FieldSide(player));
};

var Permanent = function Permanent() {};

// wraps a Permanent that is referenced by the Battlefield
var PermanentWrapper = function PermanentWrapper() {};

var Battle = function Battle() {};
