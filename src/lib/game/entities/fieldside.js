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

		//this.addAnim('visible', 1, [0], true);
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

        this.familiarsLine = { x: this.pos.x + this.size.x / 2, y: isAllied ? upperY : lowerY };
        this.othersLine = { x: this.pos.x + this.size.x / 2, y: middleY };
        this.magesLine = { x: this.pos.x + this.size.x / 2, y: isAllied ? lowerY : upperY };

        var isFamiliar = function(permanent) {
            return _(permanent.spellTypes).include(SpellType.Familiar);
        }
        var numberOfMages = side.mages.length,
            numberOfFamiliars = side.permanents.filter(isFamiliar).length,
            numberOfOthers = side.permanents.length - numberOfFamiliars;


        side.permanents.filter(isFamiliar).forEach(function(familiar, index) {
            GUI.game.spawnEntity(
                EntityPermanent,
                this.familiarsLine.x + EntityPermanent.prototype.size.x * (index - numberOfFamiliars / 2),
                this.familiarsLine.y
            ).applySettings({
                model: familiar
            });
        }, this);

        side.permanents.filter(function(permanent) { return !isFamiliar(permanent); }).forEach(function(other, index) {
            GUI.game.spawnEntity(
                EntityPermanent,
                this.othersLine.x + EntityPermanent.prototype.size.x * (index - numberOfOthers / 2),
                this.othersLine.y
            ).applySettings({
                model: other
            });
        }, this);

        // TODO: include padding
        side.mages.forEach(function(mage, index) {
            GUI.game.spawnEntity(
                EntityMage,
                this.magesLine.x + EntityMage.prototype.size.x * (index - numberOfMages / 2),
                this.magesLine.y
            ).applySettings({
                model: mage
            });
        }, this);

        return this;
	},
	draw: function() {
		this.parent();
	}
});

});
