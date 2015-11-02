'use strict';

window.Networking = {
  getNextMessage: function() {
    return Networking.inbox.shift();
  },
  inbox: [],
  setup: function setupNetworking(callback) {
    window.onunload = function() {
      env.peer.disconnect();
      env.peer.destroy();
    };

    (function() {
      if(typeof env === 'undefined') {
        env = {};
      }
      var datGui;

      window.chat = function(message) {
        env.conn.send({
          from: env.peer.id,
          message: message
        });
      };

      function prepareOpenedConnection() {
        console.log('connection established');

        // Receive messages
        env.conn.on('data', function(data) {
          console.log('data received', data);
          Networking.inbox.push(data);
        });
      }

    // creates a new peer and sets up its disconnection gui
      function createPeer() {
        var peer = new Peer({key: 'klgy15uvondpwrk9'}),
          disconnectDatGui = new dat.GUI(),
          discon = disconnectDatGui.add(peer, 'disconnect');
        disconnectDatGui.add(peer, 'destroy');

        peer.on('disconnected', function() {
          console.log('peer disconnected');
          disconnectDatGui.remove(discon);
          disconnectDatGui.destroy();
        });
        peer.on('close', function() {
          console.log('peer disconnected and destroyed');
          disconnectDatGui.destroy();
        });

        return peer;
      };

      // Client: join game
      var join = {
        'host id': 'Host ID',
        join: function() {
          datGui.destroy();

          console.log('try to join game', join['host id']);
          var peer = env.peer = createPeer();
          var conn = env.conn = peer.connect(join['host id']);
          conn.on('open', function() {
            prepareOpenedConnection();
            peer.disconnect();
            var isHost = false;
            callback(isHost);
          });
        },
        init: function() {
          datGui = new dat.GUI();
          datGui.add(join, 'host id');
          datGui.add(join, 'join');
        }
      };

      var aiGame = function() {
        Networking = {
          __ai_commands__: undefined,
          getNextMessage: function() {
            var msg = Networking.__ai_commands__ && Networking.__ai_commands__.shift();
            if(msg) {
              return msg;
            }
            return {
              command: 'endTurn'
            }
          },
          __ai_set_current_character__: function(character) {
            console.log('AI: Plan turn for', character);
            if(character instanceof Permanent) {
              let enemies = game.battlefield.getCharactersMatching(function(c) {
                return (c.mage || c) !== character.mage
              });
              Networking.__ai_commands__ = [
                {
                  command: 'battle',
                  combatants: [character.id, enemies[0].id]
                },
                {
                  command: 'endTurn'
                }
              ];
            } else if(character instanceof Mage) {
              Networking.__ai_commands__ = [
                {
                  command: 'placeSyllable',
                  fieldX: 1,
                  fieldY: 2,
                  indexInSyllablePool: 12
                },
                {
                  command: 'placeSyllable',
                  fieldX: 1,
                  fieldY: 3,
                  indexInSyllablePool: 1
                },
                {
                  command: 'placeSyllable',
                  fieldX: 0,
                  fieldY: 3,
                  indexInSyllablePool: 12
                },
                {
                  command: 'endTurn'
                }
              ];
            }
          }
        };

        env.conn = {
          send: function() {}
        }
      };

      // Host side
      var host = {
        init: function() {
          var peer = env.peer = createPeer();
          var hostIdDatGui = new dat.GUI();

          peer.on('open', function(id) {
            console.log('My peer ID is: ' + id);
            hostIdDatGui.add({ id: id }, 'id');
          });

          peer.on('connection', function(conn) {
            env.conn = conn;
            conn.on('open', function() {
              hostIdDatGui.destroy();
              prepareOpenedConnection();
              peer.disconnect();
              var isHost = true;
              callback(isHost);
            });
          });
        }
      };

      var hostOrClient = {
        'host game': function() {
          datGui.destroy();
          host.init();
        },
        'join game': function() {
          datGui.destroy();
          join.init();
        },
        'ai game': function() {
          datGui.destroy();
          aiGame();
          callback(true);
        },
        init: function() {
          datGui = new dat.GUI();
          datGui.add(hostOrClient, 'ai game');
          datGui.add(hostOrClient, 'host game');
          datGui.add(hostOrClient, 'join game');
        }
      };

      hostOrClient.init();
    })();
  }
};
