'use strict';

class Trigger {
    constructor(check, action) {
        this.check = check;
        this.action = action;
    }

    match(event, ...args) {
        return this.check(event, ...args);
    }

    performAction(event, ...args) {
        this.action(event, ...args);
    }
}

const EVENT_START_TURN = 'EVENT_START_TURN';

const EVENT_MAP = new Map();
EVENT_MAP.set(EVENT_START_TURN, function(character) {
    character.startTurn();
});

class ONS_Event {
    static before() {}
    static on() {}
    static after() {}
}

class ONS_EventManager {
    do(eventIdentifier, ...args) {
        EVENT_MAP.get(eventIdentifier).apply(undefined, args);
        var activatedTriggers = this.checkTriggers(eventIdentifier, args);
        activatedTriggers.forEach(trigger => {
            trigger.performAction(eventIdentifier, ...args);
        });
    }

    checkTriggers(eventIndentifier, args) {
        console.log(eventIndentifier);
        var afterTriggers = [];
        for(let fieldSide of game.battlefield.sides.values()) {
            fieldSide.mages.forEach(mage => {
                console.log(mage);
                (mage.afterTriggers || []).forEach(trigger => {
                    if(trigger.match(eventIndentifier, ...args)) {
                        afterTriggers.push(trigger);
                    }
                });
            });
            fieldSide.permanents.forEach(permanent => {
                console.log(permanent);
                (permanent.afterTriggers || []).forEach(trigger => {
                    if(trigger.match(eventIndentifier, ...args)) {
                        afterTriggers.push(trigger);
                    }
                });
            });
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
