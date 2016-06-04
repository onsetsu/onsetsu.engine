import { Permanent } from './engine/enginebattlefield.js';
import { Mage } from './engine/engine.js';

const FIREBASE_ROOT = 'https://onsetsu.firebaseIO.com',
    ROOM_ADDRESS = FIREBASE_ROOT + '/lobby/rooms',
    PEERJS_KEY = 'klgy15uvondpwrk9';

export var Networking = {
  getNextMessage: function() {
    return Networking.inbox.shift();
  },
  inbox: [],
  setup: function setupNetworking(callback) {
    var peer;
    window.addEventListener("beforeunload", function disconnectPeerJS() {
      peer.disconnect();
      peer.destroy();
    });

    if(typeof env === 'undefined') {
      env = {};
    }

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
      var peer = new Peer({key: PEERJS_KEY});

      peer.on('disconnected', () => console.log('peer disconnected'));
      peer.on('close', () => console.log('peer disconnected and destroyed'));

      return peer;
    }

    // Client: join game
    class JoinGame {
      static join(hostId) {
        this.datGui.destroy();

        console.log('try to join game', hostId);
        peer = createPeer();
        var conn = env.conn = peer.connect(hostId);
        conn.on('open', function() {
          prepareOpenedConnection();
          peer.disconnect();
          callback(false);
        });
      }

      static init() {
        this.datGui = new dat.GUI();
        var roomInfos = {};
        var rooms = new Firebase(ROOM_ADDRESS);
        rooms.on('child_added', snapshot => {
          var li = this.datGui.add({ func: () => {
            JoinGame.join(snapshot.val().peerId);
            Firebase.goOffline();
          }}, 'func');
          li.name(snapshot.val().name);
          roomInfos[snapshot.key()] = { li, snapshot };
        }, error => console.log('reading rooms failed', error));
        rooms.on('child_changed', snapshot => {
          roomInfos[snapshot.key()].li.name(snapshot.val().name);
        }, error => console.log('changing rooms failed', error));
        rooms.on('child_removed', snapshot => {
          roomInfos[snapshot.key()].li.remove();
        }, error => console.log('removing rooms failed', error));
      }
    }

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
    class HostGame {
      static init() {
        peer = createPeer();
        var datGui = new dat.GUI();
        var rooms = new Firebase(ROOM_ADDRESS);

        peer.on('open', id => {
          console.log('My peer ID is: ' + id);

          var newRoomRef = rooms.push({
            peerId: id,
            name: id
          });

          // safely close the room behind you
          function disposeRoom() {
            newRoomRef.set(null);
          }
          function closeRoom() {
            window.removeEventListener('beforeunload', disposeRoom);
            disposeRoom();
          }
          window.addEventListener('beforeunload', disposeRoom);

          function closeHost() {
            closeRoom();
            datGui.destroy();
            peer.disconnect();
          }

          datGui.add({ 'your room name': id }, 'your room name').onChange(val => {
            newRoomRef.update({ name: val });
          });
          datGui.add({ 'close room': () => {
            closeHost();
            ChooseGameMode.init();
          }}, 'close room');

          peer.on('connection', conn => {
            env.conn = conn;
            conn.on('open', () => {
              closeHost();
              prepareOpenedConnection();
              callback(true);
            });
          });
        });
      }
    }

    class ChooseGameMode {
      static create_room() {
        this.datGui.destroy();
        HostGame.init();
      }
      static join_room() {
        this.datGui.destroy();
        JoinGame.init();
      }
      static ai_game() {
        this.datGui.destroy();
        aiGame();
        callback(true);
      }
      static init() {
        this.datGui = new dat.GUI();
        this.datGui.add(ChooseGameMode, 'ai_game');
        this.datGui.add(ChooseGameMode, 'create_room');
        this.datGui.add(ChooseGameMode, 'join_room');
      }
    }

    ChooseGameMode.init();
  }
};
