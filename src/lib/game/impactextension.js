ig.module(
	'game.impactextension'
)
.requires(
	'impact.game',
	'impact.font',

    'game.gui.spellbook',
	'game.gui.syllablepool',
	'game.gui.syllableboard',
	'game.gui.timeline',
	'game.gui.battlefield',

    // entities
	//'game.entities.battle-field',
	//'game.entities.field',
	//'game.entities.info-text',
	//'game.entities.spell',
	//'game.entities.spell-checker',
	//'game.entities.spell-list',
	'game.entities.syllable',
	//'game.entities.syllable-board',
	//'game.entities.syllable-selection',
	//'game.entities.time-line',

    // maps
	'game.levels.battle'

	// handler
	//'game.handler.selecttarget'
)
.defines(function(){

ig.Input.inject({
    hover: function(entity) {
        if(this.mouse.x < entity.pos.x) return false;
        if(this.mouse.y < entity.pos.y) return false;
        if(this.mouse.x > entity.pos.x + entity.size.x) return false;
        if(this.mouse.y > entity.pos.y + entity.size.y) return false;
        return true;
    }
});

ig.Entity.inject({
	move: function(position, time) {
	    this.tween = {
	        startPosition: { x: this.pos.x, y: this.pos.y },
    	    endPosition: position,
    	    duration: time,
    	    timeDone: 0
	    };
	},
	update: function() {
        this.parent();

        if(this.tween) {
            // tween finished?
            if(this.tween.timeDone >= this.tween.duration) {
                this.pos.x = this.tween.endPosition.x;
                this.pos.y = this.tween.endPosition.y;
                this.tween = undefined;
                return;
            }

            var easeQuarticInOut = function(a) {
                if((a*=2)<1)
                    return 0.5*a*a*a*a;
                return-0.5*((a-=2)*a*a*a-2)
            };
            var easeLinear = function(a) { return a; };

            this.tween.timeDone += ig.system.tick;
            this.pos.x = this.tween.startPosition.x +
                (this.tween.endPosition.x - this.tween.startPosition.x) *
                easeQuarticInOut((this.tween.timeDone / this.tween.duration));
            this.pos.y = this.tween.startPosition.y +
                (this.tween.endPosition.y - this.tween.startPosition.y) *
                easeQuarticInOut((this.tween.timeDone / this.tween.duration));
        }
	},
	markOnTurn: function(value) {
	    this.shouldMarkOnTurn = value;
	},
    visualizeSelectable: function(value) {
        this.shouldVisualizeSelectable = value;
        this.dashOffset = 0;
        this.dashOffsetSpeed = 40;
    },
    visualizeSelected: function(value) {
        this.shouldVisualizeSelected = value;
    },
    addSelectedNumbers: function(number, shouldShowOnlyTargetQuantity) {
        this.shouldVisualizeSelectedNumbers = this.shouldVisualizeSelectedNumbers || [];
        this.shouldShowOnlyTargetQuantity = shouldShowOnlyTargetQuantity;
        this.shouldVisualizeSelectedNumbers.push(number);
    },
    clearSelectedNumbers: function() {
        this.shouldVisualizeSelectedNumbers = undefined;
    },
	drawBattleLine: function(target, duration) {
	    var battleLine = this.battleLine = {
	        target: target,
	        duration: duration,
            dashOffset: 0,
            dashOffsetSpeed: 80
	    };
        return new Promise(function(resolve, reject) {
            battleLine.resolve = resolve;
        });
	},
	draw: function() {
	    this.parent();

        if(this.shouldMarkOnTurn) {
            // TODO: duplicated logic
            ig.system.context.save();
            ig.system.context.strokeStyle = this.colors.onTurn;
            ig.system.context.lineWidth = 2.0;
            ig.system.context.strokeRect(
                ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5 - 2,
                ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5 - 2,
                (this.size.x+4) * ig.system.scale,
                (this.size.y+4) * ig.system.scale
            );
            ig.system.context.restore();
        }

        if(this.shouldVisualizeSelectable) {
            // TODO: duplicated logic
            ig.system.context.save();
            ig.system.context.strokeStyle = this.colors.selectable;
            ig.system.context.setLineDash([4,4]);
            this.dashOffset += this.dashOffsetSpeed * ig.system.tick;
            while(this.dashOffset > 16) { this.dashOffset -= 16; }
            ig.system.context.lineDashOffset = -this.dashOffset;
            ig.system.context.lineWidth = 2.0;
            ig.system.context.strokeRect(
                ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
                ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
                this.size.x * ig.system.scale,
                this.size.y * ig.system.scale
            );
            ig.system.context.restore();
        }

        if(this.shouldVisualizeSelected) {
            ig.system.context.save();
            ig.system.context.strokeStyle = this.colors.selectable;
            ig.system.context.lineWidth = 2.0;
            ig.system.context.strokeRect(
                ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
                ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
                this.size.x * ig.system.scale,
                this.size.y * ig.system.scale
            );
            ig.system.context.restore();
        }

        if(this.shouldVisualizeSelectedNumbers) {
            let targetingInfo = this.shouldShowOnlyTargetQuantity ?
                this.shouldVisualizeSelectedNumbers.map(() => 'O').join('') :
                this.shouldVisualizeSelectedNumbers.join(', ');
            ig.system.context.save();

            // styling
            ig.system.context.fillStyle = this.colors.selectedNumbers;
            ig.system.context.font = "8px Arial";
            ig.system.context.textAlign = "left";
            ig.system.context.textBaseline = 'bottom';

            ig.system.context.fillText(
                targetingInfo,
                ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
                ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5
            );

            ig.system.context.restore();
        }

        if(this.battleLine) {
            // TODO: duplicated logic
            ig.system.context.save();
            ig.system.context.strokeStyle = this.colors.battleLine;
            ig.system.context.setLineDash([16,16]);
            this.battleLine.dashOffset += this.battleLine.dashOffsetSpeed * ig.system.tick;
            while(this.battleLine.dashOffset > 64) { this.battleLine.dashOffset -= 64; }
            ig.system.context.lineDashOffset = -this.battleLine.dashOffset;
            ig.system.context.lineWidth = 4.0;
            this.drawLineTo(this.battleLine.target);
            ig.system.context.restore();

            this.battleLine.duration -= ig.system.tick;
            if(this.battleLine.duration <= 0) {
                var resolve = this.battleLine.resolve;
                this.battleLine = undefined;
                resolve();
            }
        }

    },
    drawRelatedTo: function(entity) {
        ig.system.context.save();
        ig.system.context.strokeStyle = this.colors.related;
        ig.system.context.lineWidth = 4.0;

        this.drawLineTo(entity);

        ig.system.context.restore();
	},
	drawLineTo: function(entity) {
        ig.system.context.beginPath();
        ig.system.context.moveTo(
            this.pos.x + this.size.x / 2,
            this.pos.y + this.size.y / 2
        );
        ig.system.context.lineTo(
            entity.pos.x + entity.size.x / 2,
            entity.pos.y + entity.size.y / 2
        );
        ig.system.context.stroke();
    }
});

ig.Entity.inject({
	colors: {
		names: '#fff',
		velocities: '#0f0',
        onTurn: '#0ff',
        selectable: '#ff0',
        selectedNumbers: '#ff0',
        battleLine: '#f00',
        related: '#0f0',
		boxes: '#f00'
	}
});

});
