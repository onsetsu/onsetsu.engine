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
        var upperPosition = { x: 700, y: 100 },
            lowerPosition = { x: 700, y: 300 },
            upperSidesPadding = 0,
            lowerSidesPadding = 0;

	    game.battlefield.sides.forEach(function(side, player) {
	        var isAllied = allied(player, GUI.game.visualizedMainPlayer);
    	    GUI.game.spawnEntity(
    	        EntityFieldSide,
    	        (isAllied ? lowerPosition : upperPosition).x,
    	        (isAllied ? lowerPosition : upperPosition).y
    	            + (isAllied ? lowerSidesPadding : upperSidesPadding)
    	    ).applySettings({
    	        model: side
    	    });
            isAllied ?
                lowerSidesPadding += EntityFieldSide.prototype.size.x :
                upperSidesPadding += EntityFieldSide.prototype.size.x;
	    });
	},

	update: function() {}
});

});
