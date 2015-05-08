// --------------------------------------------------------------------------------
// Battlefield
// --------------------------------------------------------------------------------

var FieldSide = function(player) {
  this.player = player;
  this.mages = [];
  this.permanents = [];
};
FieldSide.prototype.addPermanent = function(permanent) {
  this.permanents.push(permanent);
};
FieldSide.prototype.addMage = function(mage) {
  this.mages.push(mage);
};

var Zone = function Zone() {};

var Battlefield = function Battlefield() {
  this.sides = new Map();
};
Battlefield.prototype.addPlayer = function(player) {
  this.sides.set(player, new FieldSide(player));
};
Battlefield.prototype.addPermanent = function(permanent, mage) {
  this.sides.get(mage.controller).addPermanent(permanent);
};
Battlefield.prototype.addMage = function(mage) {
  this.sides.get(mage.controller).addMage(mage);
};

var Permanent = function Permanent(settings) {
  this.spellTypes = settings.spellTypes;
  this.hp = settings.hp;
  this.at = settings.at;
};

// wraps a Permanent that is referenced by the Battlefield
var PermanentWrapper = function PermanentWrapper() {};

var Battle = function Battle() {};

