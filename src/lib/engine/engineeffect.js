'use strict';

const STATIC_ABILITY = {};

class EffectTimeStamp {

}

class Ability {}
class Effect {
    static getTimeStamp() {

    }

    static createEffect() {
        return new Effect();
    }

    constructor() {
        this.timeStamp = Effect.getTimeStamp();
    }
}

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

class ReplacementEffect extends Effect {
    constructor(check, replaceEvent) {
        super();
        this.match = check;
        this.replaceEvent = replaceEvent;
    }
}

const EVENT_START_TURN = 'EVENT_START_TURN';
const EVENT_DEAL_DAMAGE = 'EVENT_DEAL_DAMAGE';

const EVENT_MAP = new Map();
EVENT_MAP.set(EVENT_START_TURN, function(character) {});
EVENT_MAP.set(EVENT_DEAL_DAMAGE, function(character, amount) {
    //if(character.isBrocky) {
    //    amount -= 1;
    //}
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
        console.log(eventIdentifier, '-------------------------------------');
        var replacedEventWithArgs = this.doReplacement(eventIdentifier, ...args);
        this.execEvent.apply(this, replacedEventWithArgs);
        this.doAfterTrigger.apply(this, replacedEventWithArgs);
    }

    doReplacement(...args) {
        console.log(...args);
        var usedReplacementEffects = new Set();
        var possibleReplacements = (function() {
            var replacementEffects = [];

            function pushReplacementEffects(character) {
                replacementEffects.push(...(character.replacementEffects || []));
            }
            for(let fieldSide of game.battlefield.sides.values()) {
                fieldSide.mages.forEach(pushReplacementEffects);
                fieldSide.permanents.forEach(pushReplacementEffects);
            }
            return replacementEffects;
        })();
        console.log('Replacements:', possibleReplacements);

        // TODO: loop til no matching replacement is found
        var matchingReplacements;
        function updateMatchingReplacements() {
            matchingReplacements = possibleReplacements.filter(function(replacementEffect) {
                return replacementEffect.match(...args) && !usedReplacementEffects.has(replacementEffect);
            });
        }
        updateMatchingReplacements();
        while(matchingReplacements.length > 0) {
            let chosenReplacement = matchingReplacements.reduce(function(previousReplacementEffect, replacementEffect) {
                return replacementEffect;
                // TODO: consider timeStamp
                //return replacementEffect.timeStamp.before(previousReplacementEffect.timestamp);
            });

            args = chosenReplacement.replaceEvent(...args);
            usedReplacementEffects.add(chosenReplacement);

            updateMatchingReplacements();
        }

        return args;
    }

    execEvent(eventIdentifier, ...args) {
        EVENT_MAP.get(eventIdentifier).apply(undefined, args);
    }

    doAfterTrigger(eventIdentifier, args) {
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
