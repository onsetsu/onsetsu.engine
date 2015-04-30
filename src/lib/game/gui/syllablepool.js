ig.module(
	'game.gui.syllablepool'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.syllable'
)
.defines(function(){

GUI.SyllablePool = ig.Class.extend({
	init: function() {
		GUI.game.spawnEntity(EntitySyllable, 404, 30, { model: Syllables.SOL });
		GUI.game.spawnEntity(EntitySyllable, 436, 30, { model: Syllables['7TH_ELEMENT'] });
		GUI.game.spawnEntity(EntitySyllable, 468, 30, { model: Syllables.OMNIPOTENCE });
        game.players[0].mages[0].syllablePool.syllables.forEach(function(syllable, index) {
            GUI.game.spawnEntity(EntitySyllable, 500 + 32 * index, 30, { model: syllable });
        });
	},

	update: function() {}
});

});
