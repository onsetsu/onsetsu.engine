ig.module(
	'game.gui.battlefield'
)
.requires(
	'impact.impact',
	'impact.font',

	'game.entities.spell'
)
.defines(function(){

GUI.Battlefield = ig.Class.extend({
    paddingBetweenSpells: 4,
	init: function() {
	    return;
	    var spellPadding = 0;
        game.players[0].mages[0].spellBook.getSpells().forEach(function(spell, index) {
            var entitySpell = GUI.game.spawnEntity(EntitySpell, 2, 2 + spellPadding, { model: spell });
            spellPadding += entitySpell.size.y + this.paddingBetweenSpells;
        }, this);
	},

	update: function() {}
});

});
