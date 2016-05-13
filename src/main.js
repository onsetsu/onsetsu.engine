import { Networking } from 'lib/networking.js';
import { configureGameForTwoPlayers } from 'lib/setup/setup.js';
import { Game } from 'lib/engine/enginegame.js';
import GUIGame from './lib/game/gui.game.js';
import {} from './lib/game/impactextension.js';
import { setIsHost } from './lib/ishost.js';

var runMain = function(host) {
  game = new Game();
  configureGameForTwoPlayers();
  setIsHost(host);

  ig.main( '#canvas', GUIGame, 60, 1138, 640, 1 );
};

Networking.setup(runMain);
