export class HUB {
    constructor() {}

    giveTargets() {
        return Promise.resolve();
    }

    getChoice() {
        return Promise.resolve();
    }

    getPlayerAction() {
        return Promise.resolve();
    }
}

export var hub = new HUB();
