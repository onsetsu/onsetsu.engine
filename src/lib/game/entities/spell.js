ig.module(
	'game.entities.spell'
)
.requires(
	'impact.entity',
	'game.font',
	'game.entities.syllable'
)
.defines(function(){

EntitySpell = ig.Entity.extend({
	size: {x:32, y:32},
	sequencePadding: 4,
	init: function(x, y, settings) {
		this.parent(x, y, settings);

        this.applySettings(settings);
	},
	applySettings: function(settings) {
        var spell = this.model = settings.model;

        var syllablePadding = 0;
        spell.getBaseSequences().forEach(function(sequence, sequenceIndex) {
            sequence.getSyllables().forEach(function(syllable, syllableIndex) {
                GUI.game.spawnEntity(
                    EntitySyllable,
                    this.pos.x + syllablePadding,
                    this.pos.y + GUI.Font.heightForString(''),
                    { model: syllable }
                );
                syllablePadding += this.animSheet.width;
            }, this);
            syllablePadding += this.sequencePadding;
        }, this);

        this.size = {
            x: Math.max(
                GUI.Font.widthForString(this.model.spellName),
                GUI.Font.widthForString(this.model.effectText)),
            y: GUI.Font.heightForString(this.model.spellName) +
                this.animSheet.height +
                GUI.Font.heightForString(this.model.effectText)
        };
	},
	draw: function() {
		this.parent();

		// draw name
		var x = this.pos.x,
            y = this.pos.y;
		GUI.Font.draw(this.model.spellName, x, y, ig.Font.ALIGN.LEFT);

		// draw effect
		var y = this.pos.y + this.animSheet.height + GUI.Font.heightForString('');
		GUI.Font.draw(this.model.effectText, this.pos.x, y, ig.Font.ALIGN.LEFT);
	}
});

});
