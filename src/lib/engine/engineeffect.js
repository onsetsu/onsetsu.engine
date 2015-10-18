'use strict';

/**
 * Trigger class
 * supports:
 * - match: check whether an event matches the trigger
 * - performAction: execute the effect if the trigger event matched
 */
class Trigger {
    constructor(check, action) {
        this.match = check;
        this.performAction = action;
    }
}

const EVENT_START_TURN = 'EVENT_START_TURN';
const EVENT_DEAL_DAMAGE = 'EVENT_DEAL_DAMAGE';

const EVENT_MAP = new Map();
EVENT_MAP.set(EVENT_START_TURN, function(character) {});
EVENT_MAP.set(EVENT_DEAL_DAMAGE, function(character, amount) {
    character.hp -= amount;
    checkStateBasedActions();
});

class ONS_Event {
    static before() {}
    static on() {}
    static after() {}
}

class ONS_EventManager {
    execute(eventIdentifier, ...args) {
        console.log(eventIdentifier);

        EVENT_MAP.get(eventIdentifier).apply(undefined, args);
        var activatedTriggers = this.checkTriggers(eventIdentifier, args);
        activatedTriggers.forEach(trigger => {
            trigger.performAction(eventIdentifier, ...args);
        });
    }

    checkTriggers(eventIdentifier, args) {
        var afterTriggers = [];

        function pushActivatedTriggers(character) {
            console.log(character);
            var acti = (character.afterTriggers || []).filter(trigger => {
                return trigger.match(eventIdentifier, ...args);
            });
            afterTriggers.push(...acti);
        }
        for(let fieldSide of game.battlefield.sides.values()) {
            fieldSide.mages.forEach(pushActivatedTriggers);
            fieldSide.permanents.forEach(pushActivatedTriggers);
        }
        return afterTriggers;
    }
}

class Pointer {
    constructor() {

    }
}

const STATIC_ABILITY = {};

class Ability {}
class Effect {
    static createEffect() {
        return new Effect();
    }
}


function checkStateBasedActions() {
    game.battlefield.removeDefeatedPermanents();
}

const TURN_BASED_ACTIONS = {
    /**
     * At the start of the turn of a mage:
     * - increase its maxSp
     * - then, reset its sp to that value
     * @param mage
     */
    START_MAGE_TURN: function(mage) {
        mage.maxSp = Math.min(mage.maxSp+1, 8);
        mage.sp = mage.maxSp;
    }
};
