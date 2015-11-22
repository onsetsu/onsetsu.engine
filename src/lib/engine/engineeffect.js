'use strict';

// The 4 types of abilities:
const SPELL_ABILITY = {};
const ACTIVATED_ABILITY = {};
const TRIGGERED_ABILITY = {};
const STATIC_ABILITY = {};
const LINKED_ABILITY = {};

var _effectTimeStampGenerator = new IncrementalIDGenerator();
class EffectTimeStamp {
    constructor() {
        this.id = _effectTimeStampGenerator.nextID();
    }

    before(timeStamp) {
        return this.id < timeStamp.id;
    }

    after(timeStamp) {
        return this.id > timeStamp.id;
    }
}

class Ability {}
class Effect {
    static getTimeStamp() {
        return new EffectTimeStamp();
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

const EVENT_NOOP = 'EVENT_NOOP';
const EVENT_START_TURN = 'EVENT_START_TURN';
const EVENT_DEAL_DAMAGE = 'EVENT_DEAL_DAMAGE';
const EVENT_ENTER_BATTLEFIELD = 'EVENT_ENTER_BATTLEFIELD';
const EVENT_CAST_SPELL = 'EVENT_CAST_SPELL';
const EVENT_SACRIFICE = 'EVENT_SACRIFICE';

const EVENT_MAP = new Map();
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
        return this.doAfterTrigger.apply(this, replacedEventWithArgs);
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

        var matchingReplacements;
        function updateMatchingReplacements() {
            matchingReplacements = possibleReplacements.filter(function(replacementEffect) {
                return replacementEffect.match(...args) && !usedReplacementEffects.has(replacementEffect);
            });
        }
        updateMatchingReplacements();
        while(matchingReplacements.length > 0) {
            let chosenReplacement = matchingReplacements.reduce(function(previousReplacementEffect, replacementEffect) {
                if(replacementEffect.timeStamp.before(previousReplacementEffect.timeStamp)) {
                    return replacementEffect;
                } else {
                    return previousReplacementEffect;
                }
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

    doAfterTrigger(eventIdentifier, ...args) {
        var activatedTriggers = this.checkTriggers(eventIdentifier, ...args);
        return Promise.resolve(activatedTriggers)
            .each(trigger => trigger.performAction(eventIdentifier, ...args));
    }

    checkTriggers(eventIdentifier, ...args) {
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
