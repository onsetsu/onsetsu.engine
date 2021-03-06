import { defaultFont } from './../font.js';

export default ig.Entity.extend({
	size: {x:48, y:48},
	animSheet: new ig.AnimationSheet('media/timeline.png', 48, 48),
	init: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [1], true);

		return this;
	},
	draw: function() {
		this.parent();

		var delay = this.model.delay;
		defaultFont.draw(delay, this.pos.x + this.size.x / 2, this.pos.y, ig.Font.ALIGN.CENTER);
	}
});
