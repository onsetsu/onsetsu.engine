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
FieldSide.prototype.removePermanent = function(permanent) {
  var index = this.permanents.indexOf(permanent);
  this.permanents.splice(index, 1);
};
FieldSide.prototype.addMage = function(mage) {
  this.mages.push(mage);
};
FieldSide.prototype.removeMage = function(mage) {
  var index = this.mages.indexOf(mage);
  this.mages.splice(index, 1);
};

var Zone = function Zone() {};

var Battlefield = function Battlefield() {
  this.sides = new Map();
};
Battlefield.prototype.addPlayer = function(player) {
  this.sides.set(player, new FieldSide(player));
};
// TODO: remove player has to remove all associated permanents and effects (the complete FieldSide)
Battlefield.prototype.addPermanent = function(permanent, mage) {
  this.sides.get(mage.controller).addPermanent(permanent);
};
Battlefield.prototype.removePermanent = function(permanent, mage) {
  this.sides.get(mage.controller).removePermanent(permanent);
};
Battlefield.prototype.addMage = function(mage) {
  this.sides.get(mage.controller).addMage(mage);
};

Battlefield.prototype.removeMage = function(mage) {
  this.sides.get(mage.controller).removeMage(mage);
};

Battlefield.prototype.removeDefeatedPermanents = function() {
  this.sides.forEach(function(side) {
    side.permanents.forEach(function(permanent) {
      if(permanent.hp <= 0) {
        permanent.removeFromBattlefield();
      }
    });
  });
};

var Permanent = function Permanent(settings, mage) {
  this.id = settings.id || nextID();
  this.spellTypes = settings.spellTypes;
  this.hp = settings.hp;
  this.maxHp = settings.hp;
  this.at = settings.at;
  this.baseAt = settings.at;
  this.delay = settings.delay;

  this.mage = mage;
  this.action = new Action({
    execute: this.takeTurn.bind(this)
  }, this.delay, Action.recurring, this);
};

Permanent.prototype.putOntoBattlefield = function() {
  game.battlefield.addPermanent(this, this.mage);
  game.timeline.addAction(this.action);
};

Permanent.prototype.removeFromBattlefield = function() {
  game.timeline.removeAction(this.action);
  game.battlefield.removePermanent(this, this.mage);
};

Permanent.prototype.takeTurn = function() {
  console.log('Familiar on turn.', this);
};

var Battle = function Battle(combatant1, combatant2) {
  function attack(attacker, defender) {
    // check whether the attacker has an attack value
    if(_.isNumber(attacker.at)) {
      defender.hp -= attacker.at
    }
  };

  attack(combatant1, combatant2);
  attack(combatant2, combatant1);
};
