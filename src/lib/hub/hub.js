import Interpreter from './../commands/interpreter.js';

export class HUB {
    constructor() {
        this._interpreter = new Interpreter();
    }

    giveTargets() {
        return Promise.resolve();
    }

    getChoice() {
        return Promise.resolve();
    }

    getPlayerAction() {
        return Promise.resolve();
    }

    execute(command, fromRemote) {
        if(fromRemote) {
            // no need to broadcast the command
        }
        return this._interpreter.execute(command);
    }

    static instance() {
        return this._inst || (this._inst = new HUB());
    }
}
