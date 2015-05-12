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

        var spawnSide = function(side, player) {
            var isAllied = allied(player, GUI.game.visualizedMainPlayer);
            GUI.game.spawnEntity(
                EntityFieldSide,
                (isAllied ? lowerPosition : upperPosition).x
                    + (isAllied ? lowerSidesPadding : upperSidesPadding),
                (isAllied ? lowerPosition : upperPosition).y
            ).applySettings({
                model: side
            });
            isAllied ?
                lowerSidesPadding += EntityFieldSide.prototype.size.x :
                upperSidesPadding += EntityFieldSide.prototype.size.x;
        };

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
