import EntitySyllable from './../entities/syllable.js';

export default ig.Class.extend({
	init: function() {
        var syllables = game.battlefield.sides.get(GUI.game.visualizedMainPlayer).mages[0].syllablePool.syllables;
        this.syllables = syllables.map(function(syllable, index) {
            return GUI.game.spawnEntity(EntitySyllable, 500 + 32 * index, 30, { model: syllable });
        });
	},

	update: function() {}
});
