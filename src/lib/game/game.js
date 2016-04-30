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

	'game.impactextension'
)
.defines(function(){

});
