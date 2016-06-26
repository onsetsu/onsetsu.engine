'use strict';

import { TURN_BASED_ACTIONS } from './../engine/engineeffect.js';
import { tryPlaceSyllableAndCastSpells } from './../engine/engineutilities.js';
import { Permanent } from './../engine/enginebattlefield.js';
import { Mage } from './../engine/engine.js';
import {
    EVENT_START_TURN,
    EVENT_DEAL_DAMAGE,
    EVENT_CAST_SPELL
} from './../engine/events.js';
import { Networking } from './../networking.js';
import EntityDebug from './entities/debug.js';
import Interpreter from './../commands/interpreter.js';

export default class Turn {

    constructor(action) {
        this.action = action;
    }

    whenFinished() {
        var action = this.action;
        if(action.character instanceof Mage) {
            TURN_BASED_ACTIONS.START_MAGE_TURN(action.character);
        }
        game.eventManager.execute(EVENT_START_TURN, action.character);
        var player = action.character.controller || action.character.mage.controller;
        console.log('Advanced to:', action);

        if(player === GUI.game.visualizedMainPlayer) {
            return new Promise(function(resolve, reject) {
                console.log('Main Player');
                if(action.character instanceof Permanent) {
                    console.log('Turn of Familiar');
                    GUI.game.startBattle(action.character).then(function(combatants) {
                        console.log('ENTITYDEBUG_BATTLE_TEST_FINISHED');
                        env.conn.send({
                            command: 'battle',
                            combatants: [combatants[0].id, combatants[1].id]
                        });
                        env.conn.send({
                            command: 'endTurn'
                        });
                        resolve(action);
                    });
                } else if(action.character instanceof Mage) {
                    console.log('Turn of Mage');
                    GUI.game.endTurnEntity = GUI.game.spawnEntity(EntityDebug, 350, 50, {
                        label: 'End Turn',
                        onclick: function() {
                            GUI.game.endTurnEntity = undefined;
                            this.kill();
                            env.conn.send({
                                command: 'endTurn'
                            });
                            resolve(action);
                        }
                    });
                } else {
                    throw new Error('neither Mage nor Familiar Turn');
                }
            });
        } else {
            console.log('Not-visualized Player');
            return new Promise(function(resolve, reject) {
                Networking.__ai_set_current_character__ && Networking.__ai_set_current_character__(action.character);
                var waitEntity = GUI.game.spawnEntity(EntityDebug, 350, 50, {
                    label: 'Wait For Opponent'
                });
                var listening = waitEntity.update = function() {
                    var message = Networking.getNextMessage();
                    if(message) {
                        switch (message.command) {
                          case 'endTurn':
                            this.kill();
                            resolve(action);
                            break;
                          case 'battle':
                            console.log('RECEIVED BATTLE');
                            waitEntity.update = function() {};
                            GUI.game.animatedBattle(
                                game.battlefield.charactersById.get(message.combatants[0]),
                                game.battlefield.charactersById.get(message.combatants[1])
                            ).then(function() {
                                waitEntity.update = listening;
                            });
                            break;
                          case 'switchSyllables':
                            var syllableBoard = game.battlefield.sides.get(GUI.game.opponentPlayer).mages[0].syllableBoard,
                                syl1 = GUI.game.opponentSyllableBoard.syllableStones[message.fiend1x][message.fiend1y],
                                syl2 = GUI.game.opponentSyllableBoard.syllableStones[message.fiend2x][message.fiend2y];

                            if(syllableBoard.switchSyllables(
                                syl1.index,
                                syl2.index)
                            ) {
                                syl1.kill();
                                syl2.kill();
                            }
                            break;
                          case 'placeSyllable':
                            var syllableIndex = {
                              x: message.fieldX,
                              y: message.fieldY
                            };
                            var syllableBoard = game.battlefield.sides.get(GUI.game.opponentPlayer).mages[0].syllableBoard;
                            var syllable = GUI.game.syllablePool.syllables[message.indexInSyllablePool].model.copy();
                            var callback = function(ConcreteSpell, startIndex, direction) {
                              console.log('CAST on Stack', ConcreteSpell, startIndex, ''+direction);
                              game.eventManager.execute(EVENT_CAST_SPELL, ConcreteSpell, syllableBoard.mage);
                            };

                            tryPlaceSyllableAndCastSpells(
                                syllableIndex,
                                syllableBoard,
                                syllable,
                                callback
                            );

                            game.stack.process()
                                .then(function() { console.log('DONE PROCESSING STACK'); });
                            break;
                          case 'targetForDamage':
                            var target = game.battlefield.charactersById.get(message.targetId);
                            waitEntity.update = function() {};
                            GUI.game.spellBook.spellEntities[message.spellIndex]
                                .drawBattleLine(GUI.game.battlefield.getEntityFor(target), 2)
                                .then(function() {
                                    game.eventManager.execute(EVENT_DEAL_DAMAGE, target, message.damage);
                                    waitEntity.update = listening;
                                });
                            break;
                          default:
                            throw new Error('Non matching message received', message);
                            break;
                        }
                    }
                };
            });
        }
    }
}
