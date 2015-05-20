ig.module(
	'game.gui.battlefield'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.fieldside'
)
.defines(function(){

GUI.Battlefield = ig.Class.extend({
    paddingBetweenSpells: 4,
	init: function() {
        var upperPosition = { x: 600, y: 100 },
            lowerPosition = { x: 600, y: 300 },
            upperSidesPadding = 0,
            lowerSidesPadding = 0;

        this.entitiesBySide = new Map();
        var spawnSide = (function(side, player) {
            var isAllied = allied(player, GUI.game.visualizedMainPlayer);
            var entity = GUI.game.spawnEntity(
                EntityFieldSide,
                (isAllied ? lowerPosition : upperPosition).x
                    + (isAllied ? lowerSidesPadding : upperSidesPadding),
                (isAllied ? lowerPosition : upperPosition).y
            ).applySettings({
                model: side
            });
            this.entitiesBySide.set(side, entity);
            isAllied ?
                lowerSidesPadding += EntityFieldSide.prototype.size.x :
                upperSidesPadding += EntityFieldSide.prototype.size.x;
        }).bind(this);

	    game.battlefield.sides.forEach(spawnSide);

        game.battlefield.addPlayer = _.wrap(game.battlefield.addPlayer.bind(game.battlefield), (function(original, player) {
            var returnValue = original(player);

            spawnSide(game.battlefield.sides.get(player), player);

            return returnValue;
        }).bind(this));
	},

	update: function() {
	    // TODO: check for changes of FieldSides on Battlefield
	}
});

});
