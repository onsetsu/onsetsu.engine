'use strict';

ig.module(
	'game.game'
)
.requires(
    'game.gui.spellbook',
	'game.gui.syllablepool',
	'game.gui.syllableboard',
	'game.gui.timeline',
	'game.gui.battlefield',

    // entities
	'game.entities.syllable',

    // maps
	'game.levels.battle',

	// handler
	//'game.handler.selecttarget',

	'game.impactextension'
)
.defines(function(){

});
