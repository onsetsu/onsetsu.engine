import EntitySpell from './../entities/spell.js';

const PADDING_BETWEEN_SPELLS = 4;

export default class {
    constructor() {
	    var spellPadding = 0;
        this.spellEntities = game.battlefield.sides.get(GUI.game.visualizedMainPlayer).mages[0].spellBook.getSpells().map(function(spell, index) {
            var entitySpell = GUI.game.spawnEntity(EntitySpell, 2, 2 + spellPadding, { model: spell });
            spellPadding += entitySpell.size.y + PADDING_BETWEEN_SPELLS;
            return entitySpell;
        }, this);
	}

	update() {}
}
