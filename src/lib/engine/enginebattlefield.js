// --------------------------------------------------------------------------------
// Battlefield
// --------------------------------------------------------------------------------
'use strict';

class FieldSide {
  constructor(player) {
    this.player = player;
    this.mages = [];
    this.permanents = [];
  }
  addPermanent(permanent) {
    this.permanents.push(permanent);
  }
  removePermanent(permanent) {
    var index = this.permanents.indexOf(permanent);
    this.permanents.splice(index, 1);
  }
  addMage(mage) {
    this.mages.push(mage);
  }
  removeMage(mage) {
    var index = this.mages.indexOf(mage);
    this.mages.splice(index, 1);
  }
}

class Zone {}

class Battlefield {
  constructor() {
    this.charactersById = new Map();
    this.sides = new Map();
  };
  addPlayer(player) {
    this.sides.set(player, new FieldSide(player));
  }
// TODO: remove player has to remove all associated permanents and effects (the complete FieldSide)
  addPermanent(permanent, mage) {
    this.charactersById.set(permanent.id, permanent);
    this.sides.get(mage.controller).addPermanent(permanent);
  }
  removePermanent(permanent, mage) {
    this.charactersById.delete(permanent.id);
    this.sides.get(mage.controller).removePermanent(permanent);
  }
  addMage(mage) {
    this.charactersById.set(mage.id, mage);
    this.sides.get(mage.controller).addMage(mage);
  }

  removeMage(mage) {
    this.charactersById.delete(mage.id);
    this.sides.get(mage.controller).removeMage(mage);
  }

  removeDefeatedPermanents() {
    this.sides.forEach(function(side) {
      side.permanents.forEach(function(permanent) {
        if(permanent.hp <= 0) {
          permanent.removeFromBattlefield();
        }
      });
    });
    console.log('removed defeated permanents');
  }

  // TODO: refactor to .filter
  // keep in mind: expression is currently called only with the character, not its id
  getCharactersMatching(expression) {
    var matchingCharacters = [];

    this.charactersById.forEach(function(character, id) {
      if(expression(character)) {
        matchingCharacters.push(character);
      }
    });

    return matchingCharacters;
  }

}

class Permanent {
  constructor(settings, mage) {
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

    this.onBattlefield = false;
  }

  isOnBattlefield() {
    return this.onBattlefield;
  }

  putOntoBattlefield() {
    this.onBattlefield = true;
    game.battlefield.addPermanent(this, this.mage);
    game.timeline.addAction(this.action);
  }

  removeFromBattlefield() {
    this.onBattlefield = false;
    game.timeline.removeAction(this.action);
    game.battlefield.removePermanent(this, this.mage);
  }

  takeTurn() {
    console.log('Familiar on turn.', this);
  }

  receiveDamage(amount) {
    this.hp -= amount;
    checkStateBasedActions();
  }

  startTurn() {};
  startMageTurn(mage) {};
}

class Battle {
  constructor(combatant1, combatant2) {
    function attack(attacker, defender) {
      // check whether the attacker has an attack value
      if(_.isNumber(attacker.at)) {
        defender.receiveDamage(attacker.at);
      }
    }

    attack(combatant1, combatant2);
    attack(combatant2, combatant1);
  };
}
