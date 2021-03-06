import { defaultFont } from './../font.js';

export default ig.Entity.extend({
	size: {x:32, y:48},
	animSheet: new ig.AnimationSheet('media/permanents.png', 32, 48),
	init: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	applySettings: function(settings) {
        this.model = settings.model;

		this.addAnim('visible', 1, [0], true);

		return this;
	},
	draw: function() {
		this.parent();

        // draw hp if present
        if(_.isNumber(this.model.hp) && _.isNumber(this.model.maxHp)) {
            let hp = this.model.hp.toString(),
                maxHp = this.model.maxHp.toString(),
                x = this.pos.x + this.animSheet.width;
            defaultFont.draw(hp + ' HP', x, this.pos.y, ig.Font.ALIGN.RIGHT);
        }

        // draw at if at and hp present
        // TODO: for model: split into at (current) and baseAt
        if(_.isNumber(this.model.at)) {
            let at = this.model.at.toString(),
                x = this.pos.x + this.animSheet.width,
                y = this.pos.y + this.animSheet.height - defaultFont.heightForString(at);
            defaultFont.draw(at + ' AT', x, y, ig.Font.ALIGN.RIGHT);
        }

        // TODO: duplicated with EntityMage
        if(ig.input.hover(this)) {
            for(var action of GUI.game.timeline.entitiesByAction.keys()) {
                if(this.model.action === action) {
                    this.drawRelatedTo(GUI.game.timeline.entitiesByAction.get(action));
                }
            }

            // show associated Spell
            var index = this.model.index;
            var associatedSpellEntity = GUI.game.spellBook.spellEntities[index];

            this.drawRelatedTo(associatedSpellEntity);
        }
	}
});
