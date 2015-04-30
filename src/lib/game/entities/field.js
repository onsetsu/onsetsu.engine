ig.module(
	'game.entities.field'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

GUI.FieldDescriptions = {
    'default': {
        sheetIndexStart: 0,
        sheetIndexEnd: 8
    },
    'FIRE': {
        sheetIndexStart: 42,
        sheetIndexEnd: 50
    },
    'WATER': {
        sheetIndexStart: 60,
        sheetIndexEnd: 68
    },
    'EARTH': {
        sheetIndexStart: 51,
        sheetIndexEnd: 59
    },
    'WIND': {
        sheetIndexStart: 69,
        sheetIndexEnd: 77
    },
    'LIGHT': {
        sheetIndexStart: 33,
        sheetIndexEnd: 41
    },
    'SHADOW': {
        sheetIndexStart: 24,
        sheetIndexEnd: 32
    }
};

EntityField = ig.Entity.extend({
	size: {x:32, y:32},
	animSheet: new ig.AnimationSheet('media/board.png', 32, 32),
	init: function(x, y, settings) {
		this.parent(x, y, settings);

        this.applySettings(settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [0], true);
	},
	draw: function() {
        // get description
		var description = GUI.SyllableDescriptions[this.model.type];
		// HACK:
        this.anims.visible.sequence[0] = (description || GUI.FieldDescriptions.default).sheetIndexStart;

		this.parent();
	}
});

});
