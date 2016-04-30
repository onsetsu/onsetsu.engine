import EntitySyllable from './syllable.js';
import { defaultFont } from './../font.js';

export default ig.Entity.extend({
	size: {x:32, y:32},
	animSheet: new ig.AnimationSheet('media/board.png', 32, 32),
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
                    this.pos.y + defaultFont.heightForString(''),
                    { model: syllable }
                );
                syllablePadding += this.animSheet.width;
            }, this);
            syllablePadding += this.sequencePadding;
        }, this);

        this.size = {
            x: Math.max(
                defaultFont.widthForString(this.model.spellName),
                defaultFont.widthForString(this.model.effectText)),
            y: defaultFont.heightForString(this.model.spellName) +
                this.animSheet.height +
                defaultFont.heightForString(this.model.effectText)
        };
	},
	draw: function() {
		this.parent();

		// draw name
		var x = this.pos.x,
            y = this.pos.y;
		defaultFont.draw(this.model.spellName, x, y, ig.Font.ALIGN.LEFT);

		// draw effect
		var y = this.pos.y + this.animSheet.height + defaultFont.heightForString('');
		defaultFont.draw(this.model.effectText, this.pos.x, y, ig.Font.ALIGN.LEFT);
	}
});
