import { createStandardSyllablePool, createTestSpellbook } from './spells/spells.js';
import { SyllableBoard } from './../engine/enginesyllable.js';
import { Player, Mage } from './../engine/engine.js';

export function configureGameForTwoPlayers() {
    var players = [new Player(), new Player()];
    var mages = [
        new Mage(
            players[0],
            20,
            8, // 0
            6,
            new SyllableBoard({ x: 8, y: 8 }),
            createTestSpellbook(),
            createStandardSyllablePool()
        ),
        new Mage(
            players[1],
            20,
            0,
            6,
            new SyllableBoard({ x: 8, y: 8 }),
            createTestSpellbook(),
            createStandardSyllablePool()
        )
    ];

    players.forEach(game.addPlayer.bind(game));

    mages[0].putOntoBattlefield();
    game.timeline.advance();
    game.timeline.advance();
    game.timeline.advance();
    mages[1].putOntoBattlefield();
}
