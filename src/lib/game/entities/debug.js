import { defaultFont } from './../font.js';

export default ig.Entity.extend({
    size: {x:64, y:32},
    animSheet: new ig.AnimationSheet('media/debug.png', 64, 32),
    init: function(x, y, settings) {
        this.parent(x, y, settings);

        this.addAnim('visible', 1, [0], true);
        this.applySettings(settings);
    },
    applySettings: function(settings) {
        this.settings = settings;
    },
    update: function() {
        this.parent();

        if(this.settings.onclick && ig.input.pressed('leftclick') && ig.input.hover(this)) {
            console.log(this.settings.label);
            this.settings.onclick.call(this);
        }
    },
    draw: function() {
        this.parent();

        if(this.settings.label) {
            var label = this.settings.label,
                x = this.pos.x + this.animSheet.width / 2,
                y = this.pos.y + (this.animSheet.height - defaultFont.heightForString(label)) / 2;
            defaultFont.draw(label, x, y, ig.Font.ALIGN.CENTER);
        }
    }
});
