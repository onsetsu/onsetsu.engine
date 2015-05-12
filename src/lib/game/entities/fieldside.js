ig.module(
	'game.entities.fieldside'
)
.requires(
	'impact.entity',
	'game.font',
    'game.entities.mage',
    'game.entities.permanent'
)
.defines(function(){

EntityFieldSide = ig.Entity.extend({
	size: {x:200, y:200},
	animSheet: new ig.AnimationSheet('media/board.png', 32, 32),
	sequencePadding: 4,
	init: function(x, y, settings) {
		this.parent(x, y, settings);

		this.addAnim('visible', 1, [0], true);
        //this.applySettings(settings);
	},
	applySettings: function(settings) {
        var side = this.model = settings.model,
            isAllied = allied(side.player, GUI.game.visualizedMainPlayer),
            upperY = this.pos.y
                + this.size.y * 1 / 4
                - EntityMage.prototype.size.y / 2,
            middleY = this.pos.y
                + this.size.y / 2
                - EntityMage.prototype.size.y / 2,
            lowerY = this.pos.y
                + this.size.y * 3 / 4
                - EntityMage.prototype.size.y / 2;

        this.familiarsLine = { x: this.pos.x + 100, y: isAllied ? upperY : lowerY };
        this.othersLine = { x: this.pos.x + 50, y: middleY };
        this.magesLine = { x: this.pos.x, y: isAllied ? lowerY : upperY };

        GUI.game.spawnEntity(
            EntityPermanent,
            this.familiarsLine.x,
            this.familiarsLine.y
        ).applySettings({
            model: side.mages[0]
        });
        GUI.game.spawnEntity(
            EntityPermanent,
            this.othersLine.x,
            this.othersLine.y
        ).applySettings({
            model: side.mages[0]
        });
        GUI.game.spawnEntity(
            EntityMage,
            this.magesLine.x,
            this.magesLine.y
        ).applySettings({
            model: side.mages[0]
        });
        return this;

        var syllablePadding = 0;
        spell.getSequences().forEach(function(sequence, sequenceIndex) {
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
                GUI.Font.widthForString(this.model.name),
                GUI.Font.widthForString(this.model.effectText)),
            y: GUI.Font.heightForString(this.model.name) +
                this.animSheet.height +
                GUI.Font.heightForString(this.model.effectText)
        };
	},
	draw: function() {
		this.parent();
	}
});

});
