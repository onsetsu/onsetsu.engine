ig.module(
	'game.gui.spellbook'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.spell'
)
.defines(function(){

GUI.SpellBook = ig.Class.extend({
    paddingBetweenSpells: 4,
	init: function() {
	    var spellPadding = 0;
        this.spellEntities = game.battlefield.sides.get(GUI.game.visualizedMainPlayer).mages[0].spellBook.getSpells().map(function(spell, index) {
            var entitySpell = GUI.game.spawnEntity(EntitySpell, 2, 2 + spellPadding, { model: spell });
            spellPadding += entitySpell.size.y + this.paddingBetweenSpells;
            return entitySpell;
        }, this);
	},

	update: function() {}
});

});
