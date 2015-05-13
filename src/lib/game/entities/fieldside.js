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
            thirdOfHeight = this.size.y / 3,
            upperY = this.pos.y
                + thirdOfHeight / 2
                - EntityPermanent.prototype.size.y / 2,
            middleY = this.pos.y
                + thirdOfHeight * 3 / 2
                - EntityPermanent.prototype.size.y / 2,
            lowerY = this.pos.y
                + thirdOfHeight * 5 / 2
                - EntityPermanent.prototype.size.y / 2;

        this.familiarsLine = { x: this.pos.x + this.size.x / 2, y: isAllied ? upperY : lowerY };
        this.othersLine = { x: this.pos.x + this.size.x / 2, y: middleY };
        var magesLine = { x: this.pos.x + this.size.x / 2, y: isAllied ? lowerY : upperY };

        var isFamiliar = function(permanent) {
            return _(permanent.spellTypes).include(SpellType.Familiar);
        }

        var entitiesByPermanent = new Map();
        var familiarPadding = 8;
        var otherPadding = 4;
        var adjustPermanents = (function() {
            var numberOfFamiliars = side.permanents.filter(isFamiliar).length,
                numberOfOthers = side.permanents.length - numberOfFamiliars,
                familiarIndex = 0,
                otherIndex = 0;
            side.permanents.forEach(function(permanent, index) {
                var permanentIsFamiliar = isFamiliar(permanent),
                    posX = permanentIsFamiliar ?
                        this.familiarsLine.x + (EntityPermanent.prototype.size.x + familiarPadding) * (familiarIndex - numberOfFamiliars / 2) :
                        this.othersLine.x + (EntityPermanent.prototype.size.x + otherPadding) * (otherIndex - numberOfOthers / 2),
                    posY = permanentIsFamiliar ?
                        this.familiarsLine.y :
                        this.othersLine.y;
                if(permanentIsFamiliar) {
                    familiarIndex += 1;
                } else {
                    otherIndex += 1;
                }
                if(entitiesByPermanent.has(permanent)) {
                    var entity = entitiesByPermanent.get(permanent);
                    entity.move({
                        x: posX,
                        y: posY
                    }, 1.2);
                } else {
                    var entity = GUI.game.spawnEntity(
                        EntityPermanent,
                        posX,
                        posY
                    ).applySettings({
                        model: permanent
                    });

                    entitiesByPermanent.set(permanent, entity);
                }
            }, this);

            // remove unused entities
            entitiesByPermanent.forEach(function(entity, permanent) {
                if(!_(side.permanents).contains(permanent)) {
                    entity.kill();
                    entitiesByPermanent.delete(permanent);
                }
            });
        }).bind(this);

        adjustPermanents();

        game.battlefield.addPermanent = _.wrap(game.battlefield.addPermanent.bind(game.battlefield), (function(original, permanent, mage) {
            var returnValue = original(permanent, mage);

            adjustPermanents();

            return returnValue;
        }).bind(this));

        game.battlefield.removePermanent = _.wrap(game.battlefield.removePermanent.bind(game.battlefield), (function(original, permanent, mage) {
            var returnValue = original(permanent, mage);

            adjustPermanents();

            return returnValue;
        }).bind(this));

        var entitiesByMage = new Map();
        var magePadding = 4;
        var adjustMages = function() {
            var numberOfMages = side.mages.length;
            side.mages.forEach(function(mage, index) {
                if(entitiesByMage.has(mage)) {
                    var entity = entitiesByMage.get(mage);
                    entity.move({
                        x: magesLine.x + (EntityMage.prototype.size.x + magePadding) * (index - numberOfMages / 2),
                        y: magesLine.y
                    }, 1.2);
                } else {
                    var entity = GUI.game.spawnEntity(
                        EntityMage,
                        magesLine.x + (EntityMage.prototype.size.x + magePadding) * (index - numberOfMages / 2),
                        magesLine.y
                    ).applySettings({
                        model: mage
                    });

                    entitiesByMage.set(mage, entity);
                }
            }, this);

            entitiesByMage.forEach(function(entity, mage) {
                if(!_(side.mages).contains(mage)) {
                    entity.kill();
                    entitiesByMage.delete(mage);
                }
            });
        }

        adjustMages();

        game.battlefield.addMage = _.wrap(game.battlefield.addMage.bind(game.battlefield), (function(original, mage) {
            var returnValue = original(mage);

            adjustMages();

            return returnValue;
        }).bind(this));

        game.battlefield.removeMage = _.wrap(game.battlefield.removeMage.bind(game.battlefield), (function(original, mage) {
            var returnValue = original(mage);

            adjustMages();

            return returnValue;
        }).bind(this));

        return this;
	},
	draw: function() {
		this.parent();
	}
});

});
