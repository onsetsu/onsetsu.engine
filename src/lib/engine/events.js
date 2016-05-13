import { checkStateBasedActions } from './statebasedactions.js';

// TODO: refactor to explicit dependencies
export const EVENT_NOOP = 'EVENT_NOOP';
export const EVENT_START_TURN = 'EVENT_START_TURN';
export const EVENT_DEAL_DAMAGE = 'EVENT_DEAL_DAMAGE';
export const EVENT_ENTER_BATTLEFIELD = 'EVENT_ENTER_BATTLEFIELD';
export const EVENT_CAST_SPELL = 'EVENT_CAST_SPELL';
export const EVENT_SACRIFICE = 'EVENT_SACRIFICE';

export const EVENT_MAP = new Map();
EVENT_MAP.set(EVENT_NOOP, function() {});
EVENT_MAP.set(EVENT_START_TURN, function(character) {});
EVENT_MAP.set(EVENT_DEAL_DAMAGE, function(character, amount) {
    character.hp -= amount;
    checkStateBasedActions();
});
EVENT_MAP.set(EVENT_ENTER_BATTLEFIELD, function(permanent, mage) {
    permanent.putOntoBattlefield();
});
EVENT_MAP.set(EVENT_CAST_SPELL, function(ConcreteSpellClass, mage) {
    var spell = new ConcreteSpellClass();
    spell.mage = mage;
    game.stack.push(spell);
});
EVENT_MAP.set(EVENT_SACRIFICE, function(permanent) {
    permanent.removeFromBattlefield();
});
