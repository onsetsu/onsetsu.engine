ig.module(
	'game.gui.spellbook'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.syllable'
)
.defines(function(){

GUI.SpellBook = ig.Class.extend({
	init: function() {
        game.players[0].mages[0].syllablePool.syllables.forEach(function(syllable, index) {
            GUI.game.spawnEntity(EntitySyllable, 500 + 32 * index, 110, { model: syllable });
        });
	},

	update: function() {}
});

});
