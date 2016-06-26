import { checkStateBasedActions } from './statebasedactions.js';

export default class Stack {
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
        var spell = game.stack.pop();
        console.log('Resolve Spell', spell);
        spell.effect(spell.mage)
            .then(checkStateBasedActions)
            .then(popFirstIfNotEmpty);
      };

      popFirstIfNotEmpty();
    });
  }
}
