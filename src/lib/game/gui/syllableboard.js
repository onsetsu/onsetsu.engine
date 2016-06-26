import EntitySyllable from './../entities/syllable.js';
import EntityField from './../entities/field.js';
import DataBindings from './../databindings/databindings.js';

export default class {

    spawn(entityClass, indexX, indexY, model) {
        var entity = GUI.game.spawnEntity(
            entityClass,
            this.pos.x + entityClass.prototype.size.x * indexX,
            this.pos.y + entityClass.prototype.size.y * indexY,
            { model: model }
        );
        entity.index = { x: indexX, y: indexY };

        return entity;
    }
    resetPosition(entity) {
        entity.pos.x = this.pos.x + entity.size.x * entity.index.x;
        entity.pos.y = this.pos.y + entity.size.y * entity.index.y;
    }
	constructor(player) {
	    if(player === GUI.game.opponentPlayer) {
	        this.pos = { x: 800, y: 100 }
	    } else {
            this.pos = { x: 350, y: 200 }
        }

	    this.fields = [];
	    this.syllableStones = [];

        this.setModel(player);
	    var syllableBoard = this.getModel();
        syllableBoard.fields.forEach((stripe, indexX) =>
            stripe.forEach((field, indexY) =>
                this.fields.push(this.spawn(EntityField, indexX, indexY, field))
            )
        );

        syllableBoard.syllableStones.forEach((column, indexX) => {
            this.syllableStones.push([]);
            column.forEach((syllableStone, indexY) => {
                var spawnSyllableStone = syllableModel => this.syllableStones[indexX][indexY] = this.spawn(
                    EntitySyllable,
                    indexX,
                    indexY,
                    syllableModel
                );

                // TODO:HUB
                DataBindings.watch(column, indexY, () => {
                    spawnSyllableStone(column[indexY].syllable);
                });
                if(syllableStone) {
                    spawnSyllableStone(syllableStone.syllable);
                }
            });
        });
	}
	setModel(player) {
	    return this.model = game.battlefield.sides.get(player).mages[0].syllableBoard;
	}
	getModel() {
	    return this.model;
	}

	update() {
        //console.log('this is updated!')
    }
}
