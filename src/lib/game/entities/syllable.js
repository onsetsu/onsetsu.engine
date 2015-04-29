ig.module(
	'game.entities.syllable'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

SyllableDescriptions = {
	__usused1__: {
		cost: -1,
		label: '__usused1__',
		sheetIndex: 78,
		primitives: ['__unused1__']
	},
	__usused2__: {
		cost: -1,
		label: '__usused2__',
		sheetIndex: 79,
		primitives: ['__unused2__']
	},
	Fire: {
		cost: 2,
		label: 'Fire',
		sheetIndex: 80,
		primitives: ['Fire']
	},
	Water: {
		cost: 2,
		label: 'Water',
		sheetIndex: 81,
		primitives: ['Water']
	},
	Earth: {
		cost: 2,
		label: 'Earth',
		sheetIndex: 82,
		primitives: ['Earth']
	},
	Wind: {
		cost: 2,
		label: 'Wind',
		sheetIndex: 83,
		primitives: ['Wind']
	},
	Light: {
		cost: 2,
		label: 'Light',
		sheetIndex: 84,
		primitives: ['Light']
	},
	Shadow: {
		cost: 2,
		label: 'Shadow',
		sheetIndex: 85,
		primitives: ['Shadow']
	},
	__usused3__: {
		cost: -1,
		label: '__usused3__',
		sheetIndex: 86,
		primitives: ['__usused3__']
	},
	__usused4__: {
		cost: -1,
		label: '__usused4__',
		sheetIndex: 87,
		primitives: ['__usused4__']
	},
	Kun: {
		cost: 2,
		label: 'Kun',
		sheetIndex: 88,
		primitives: ['Kun']
	},
	Gam: {
		cost: 5,
		label: 'Gam',
		sheetIndex: 89,
		primitives: ['Gam']
	},
	Nif: {
		cost: 2,
		label: 'Nif',
		sheetIndex: 90,
		primitives: ['Nif']
	},
	Pai: {
		cost: 1,
		label: 'Pai',
		sheetIndex: 91,
		primitives: ['Pai']
	},
	Chi: {
		cost: 1,
		label: 'Chi',
		sheetIndex: 92,
		primitives: ['Chi']
	},
	Ma: {
		cost: 1,
		label: 'Ma',
		sheetIndex: 93,
		primitives: ['Ma']
	},
	Ryo: {
		cost: 2,
		label: 'Ryo',
		sheetIndex: 94,
		primitives: ['Ryo']
	},
	Ex: {
		cost: 5,
		label: 'Ex',
		sheetIndex: 95,
		primitives: ['Ex']
	},
	Ren: {
		cost: 3,
		label: 'Ren',
		sheetIndex: 96,
		primitives: ['Ren']
	},
	To: {
		cost: 3,
		label: 'To',
		sheetIndex: 97,
		primitives: ['To']
	},
	Xau: {
		cost: 5,
		label: 'Xau',
		sheetIndex: 98,
		primitives: ['Xau']
	},
	Yun: {
		cost: 3,
		label: 'Yun',
		sheetIndex: 99,
		primitives: ['Yun']
	},
	FireDummy: {
		cost: -1,
		label: 'FireDummy',
		sheetIndex: 100,
		primitives: ['FireDummy']
	},
	LightDummy: {
		cost: -1,
		label: 'LightDummy',
		sheetIndex: 101,
		primitives: ['LightDummy']
	},
	WaterDummy: {
		cost: -1,
		label: 'WaterDummy',
		sheetIndex: 102,
		primitives: ['WaterDummy']
	},
	EarthDummy: {
		cost: -1,
		label: 'EarthDummy',
		sheetIndex: 103,
		primitives: ['EarthDummy']
	},
	Sol: {
		cost: -1,
		label: 'Sol',
		sheetIndex: 106,
		primitives: ['Sol', 'Light']
	},
	Luna: {
		cost: -1,
		label: 'Luna',
		sheetIndex: 107,
		primitives: ['Luna', 'Shadow']
	},
	Empty: {
		cost: -1,
		label: '',
		sheetIndex: 108,
		primitives: []
	},
	Omnipotence: {
		cost: -1,
		label: 'Omnipotence',
		sheetIndex: 109,
		primitives: ['Omnipotence', 'Fire', 'Water', 'Earth', 'Wind', 'Light', 'Shadow']
	},
	ShadowDummy: {
		cost: -1,
		label: 'ShadowDummy',
		sheetIndex: 110,
		primitives: ['ShadowDummy']
	},
	WindDummy: {
		cost: -1,
		label: 'WindDummy',
		sheetIndex: 111,
		primitives: ['WindDummy']
	},
};

EntitySyllable = ig.Entity.extend({
	size: {x:32, y:32},
	animSheet: new ig.AnimationSheet('media/board.png', 32, 32),
	init: function(x, y, settings) {
		this.parent(x, y, settings);

        this.applySettings(settings);
	},
	applySettings: function(settings) {
        this.cost = settings.cost;
        this.label = settings.label;
        this.sheetIndex = settings.sheetIndex;
        this.primitives = settings.primitives;

		this.addAnim(settings.label, 1, [settings.sheetIndex], true);
		this.currentAnim = this.anims[settings.label];
	},
	draw: function() {
		this.parent();
		
		// draw label
		var x = this.pos.x + this.animSheet.width / 2;
		var y = this.pos.y + this.animSheet.height / 4 * 3;
		GUI.Font.draw(this.label, x, y, ig.Font.ALIGN.CENTER);

		// draw cost
		var x = this.pos.x + this.animSheet.width;
		GUI.Font.draw(this.cost, x, this.pos.y, ig.Font.ALIGN.RIGHT);
	},
	matches: function(otherSyllable) {
        return this.matchesPrimitives(otherSyllable.primitives);
	},
	matchesPrimitives: function(primitiveList) {
        return _(primitiveList).difference(this.primitives).length === 0;
	},
	isEmpty: function() {
	    return this.label == 'Empty' && this.primitives.length == 0;
	},
	copy: function() {
	    return ig.game.spawnEntity(EntitySyllable, this.pos.x, this.pos.y, this.getDescription());
	},
	getDescription: function() {
	    return {
            cost: this.cost,
            label: this.label,
            sheetIndex: this.sheetIndex,
            primitives: this.primitives.slice()
	    };
	}
});

_.each(SyllableDescriptions, function(value, key) {
    EntitySyllable['get' + key] = function() { return value; };
});

});
