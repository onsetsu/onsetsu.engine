ig.module(
	'game.entities.info_message'
)
.requires(
	'impact.entity',
	'game.font'
)
.defines(function(){

EntityInfoMessage = ig.Entity.extend({
	init: function(x, y, settings) {
		this.parent(x, y, settings);
        EntityInfoMessage.instance = this;
        this.id = 1;
        this.labels = new Map();
    },
    pushInfo: function(info) {
        var id = this.id++;
        this.labels.set(id, info);
        return id;
    },
    popInfo: function(id) {
        this.labels.delete(id);
    },
	draw: function() {
		this.parent();

        var accumulatedLabel = '';
        this.labels.forEach((label, id) => {
            accumulatedLabel += label.getMessage() + '\n\n';
        });
        var label = "foo",
//        var label = this.model.baseDelay + ': ' + (this.model.recurring === Action.recurring ? 'recu' : 'once'),
            x = this.pos.x,// + this.animSheet.width / 2,
            y = this.pos.y; //+ this.animSheet.height / 4;
        GUI.Font.draw(accumulatedLabel, x, y, ig.Font.ALIGN.CENTER);
	}
});

});
