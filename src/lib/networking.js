var setupNetworking = function(callback) {
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
      });
    };

    // creates a new peer and sets up its disconnection gui
    function createPeer() {
      var peer = new Peer({key: 'klgy15uvondpwrk9'}),
        disconnectDatGui = new dat.GUI(),
        discon = disconnectDatGui.add(peer, 'disconnect');
      disconnectDatGui.add(peer, 'destroy');

      peer.on('disconnected', function() {
        console.log('peer disconnected');
        disconnectDatGui.remove(discon);
      });
      peer.on('close', function() {
        console.log('peer destroyed');
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
          callback();
        });
        conn.on('error', function(err) {
          console.log(err);
        });
      },
      init: function() {
        datGui = new dat.GUI();
        datGui.add(join, 'host id');
        datGui.add(join, 'join');
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
            chat('Hi, Client');
            peer.disconnect();
            callback();
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
      init: function() {
        datGui = new dat.GUI();
        datGui.add(hostOrClient, 'host game');
        datGui.add(hostOrClient, 'join game');
      }
    };

    hostOrClient.init();
  })();
};
