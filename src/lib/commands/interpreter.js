export default class Interpreter {
    execute(command) {
        switch (command.command) {
            // TODO: implement appropriately, and then delegate to this from turn.js
            case 'placeSyllable':
                var syllableIndex = {
                    x: message.fieldX,
                    y: message.fieldY
                };
                var syllableBoard = game.battlefield.sides.get(GUI.game.opponentPlayer).mages[0].syllableBoard;
                var syllable = GUI.game.syllablePool.syllables[message.indexInSyllablePool].model.copy();
                var callback = function (ConcreteSpell, startIndex, direction) {
                    console.log('CAST on Stack', ConcreteSpell, startIndex, '' + direction);
                    game.eventManager.execute(EVENT_CAST_SPELL, ConcreteSpell, syllableBoard.mage);
                };

                tryPlaceSyllableAndCastSpells(
                    syllableIndex,
                    syllableBoard,
                    syllable,
                    callback
                );

                game.stack.process()
                    .then(function () {
                        console.log('DONE PROCESSING STACK');
                    });
                break;
                //-----------------------------

            default:
                throw new Error('Non matching command received', command);
                break;
        }
    }
}
