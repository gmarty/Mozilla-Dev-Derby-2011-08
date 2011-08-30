'use strict';

goog.provide('tetris.Board');

goog.require('goog.History');
goog.require('goog.Uri');
goog.require('goog.history.Html5History');


/**
 * @const
 */
tetris.Board.WIDTH = 10;


/**
 * @const
 */
tetris.Board.HEIGHT = 22; // add

//var pathPrefix = new goog.Uri(document.location.href).getPath();
var pathPrefix = '/';

if (goog.history.Html5History.isSupported()) {
  tetris.Board.history = new goog.history.Html5History();

  tetris.Board.history.setUseFragment(false);
  tetris.Board.history.setPathPrefix(pathPrefix);
} else {
  tetris.Board.history = new goog.History();
}

tetris.Board.history.setEnabled(true);

tetris.Board.isBlocked = function(x, y) {
	if (x < 0 || x >= tetris.Board.WIDTH || y < 0 || y >= tetris.Board.HEIGHT ||
      tetris.blocks[y * tetris.Board.WIDTH + x].isBlocked) {
		return true;
	} else {
		return false;
	}
};

tetris.Board.checkMove = function(tetromino) {
	var pos, i, isValid, x, y;

	for (i = 0; i < 4; i++) {
		pos = tetris.Piece.PATTERNS[tetromino.pattern][tetromino.rotation][i];
		x = pos[0] / 20 + tetromino.x / 20; // check
		y = pos[1] / 20 + tetromino.y / 20;
		if (tetris.Board.isBlocked(x, y)) {
			return 0;
		}
	}
	return 1;
};

// tetris.Board.drawBoard = function(ctx, buffer, buffer_ctx) {
// 	buffer_ctx.beginPath();
// 	buffer_ctx.strokeStyle="red";
// 	buffer_ctx.strokeRect(0,0,200,400);
// 	buffer_ctx.closePath();
// 	ctx.drawImage(buffer, 0, 0);
// }

tetris.Board.clearFilledRows = function(ctx, buffer, buffer_ctx, tetromino) {
	var row, col, row2, nextLevel;
	nextLevel = 1;
	var fillRows = 0;
	for (row = tetris.Board.HEIGHT; row >= 0; ) {
		for (col = 0; col < tetris.Board.WIDTH; ++col) {
			if (!(tetris.blocks[row * tetris.Board.WIDTH + col].isBlocked)) {
				break;
			}
		}
		if (col === tetris.Board.WIDTH) {
			tetris.Score.score += tetris.Level.level * [40, 100, 300, 1200][fillRows];
			fillRows++;
			for (row2 = row - 1; row2 >= 0; row2--) {
				for (col = 0; col < tetris.Board.WIDTH; ++col) {
					// console.log("copy from the new low");
					tetris.blocks[(row2 + 1) * tetris.Board.WIDTH + col].isBlocked =
              tetris.blocks[row2 * tetris.Board.WIDTH + col].isBlocked;
					tetris.blocks[(row2 + 1) * tetris.Board.WIDTH + col].color =
              tetris.blocks[row2 * tetris.Board.WIDTH + col].color;
				}
			}
			// reset the top row
			// lastRow = 0;
			for (col = 0; col <= tetris.Board.WIDTH; col++) {
				tetris.blocks[col].isBlocked = false;
			}

			tetris.Piece.redraw(ctx, buffer, buffer_ctx);
			tetris.Board.updateTitle();
		} else {
			row--;
		}
	}
	tetris.rowsCleared.num = tetris.rowsCleared.num + fillRows;
	nextLevel = 1 + Math.floor(tetris.rowsCleared.num / 4);
	tetris.Level.level = nextLevel;
	tetris.Board.updateTitle();
	tetris.Board.updateSpeed();
};

tetris.Board.showNextPiece = function() {
	tetris.Piece.startTetromino(nextTetromino);
  var tetrominoChar = tetris.Piece.PATTERNS[nextTetromino.pattern][4];

  if (DEBUG) {
    goog.global.console['info'](nextTetromino.pattern, tetrominoChar);
  }

  tetris.Board.history.setToken('#Next: ' + tetrominoChar);
};

tetris.Board.isEnd = function() {
	var col;
	for (col = 0; col < tetris.Board.WIDTH && tetris.isEnd.end === false; col++) {
		if (tetris.Board.isBlocked(col, 0)) {
			clearInterval(tetris.intervalInt.i);
			// storage the scores and rows completed in the local storage
			tetris.Score.allScores.push(tetris.Score.score);
			// tetris.rowsCleared.completedRows.push(tetris.rowsCleared.num);
			//tetris.localStorage.store(); // store the score
			//tetris.localStorage.list(); // list the scroes in the aside

			gameOver.innerHTML = 'Game Over';
			document.onkeydown = function(event) {
				var keyCode;

			  if (event === null) {
			    keyCode = window.event.keyCode;
			  } else {
			    keyCode = event.keyCode;
			  }
				if (keyCode === 82) {
					tetris.restartgame();
				}
			};
			tetris.isEnd.end = true;
		}
	}
};

tetris.Board.updateTitle = function() {
  titleEl.innerHTML = 'Score: ' + tetris.Score.score +
      ' / Level: ' + tetris.Level.level +
      ' / Speed: ' + tetris.gameSpeed.num;
};

tetris.Board.updateSpeed = function() {
	var speedup = 100;
	var temp = 0;
	if (tetris.Level.level >= 5) {
		speedup = 10;
		tetris.gameSpeed.num = 200 - (tetris.Level.level - 4) * speedup;
	} else {
		tetris.gameSpeed.num = 800 - (tetris.Level.level - 1) * speedup;
	}
	clearInterval(tetris.intervalInt.i);
	tetris.intervalInt.i = setInterval(function() {
    tetris.Piece.move(ctx, buffer, buffer_ctx, tetromino);
  }, tetris.gameSpeed.num);
};

tetris.Board.sleep = function(ms) {
	var dt = new Date();
	dt.setTime(dt.getTime() + ms);
	while (new Date().getTime() < dt.getTime()) {tetris.Board.key();}
};

tetris.Board.key = function() {
	document.onkeydown = function(event) {
	  var keyCode;

	  if (event === null) {
	    keyCode = window.event.keyCode;
	  } else {
	    keyCode = event.keyCode;
	  }
		// console.log(keyCode);
	  switch (keyCode) {
	    // left
	    case 37:
	      // action when pressing left key
				// tetris.Piece.changMove = function(ctx, buffer, buffer_ctx, tetromino, dx, dy);
				if (!tetris.cannotMove)
					tetris.Piece.changMove(ctx, buffer, buffer_ctx, tetromino, -20, 0);
	      break;
	    // up
	    case 38:
        // action when pressing up key
				if (!tetris.cannotMove)
					tetris.Piece.rotation(ctx, buffer, buffer_ctx, tetromino);
	      break;

	    // right
	    case 39:
        // action when pressing right key
				if (!tetris.cannotMove)
					tetris.Piece.changMove(ctx, buffer, buffer_ctx, tetromino, 20, 0);
	      break;

	    // down
	    case 40:
        // action when pressing down key
				if (!tetris.cannotMove)
					tetris.Piece.changMove(ctx, buffer, buffer_ctx, tetromino, 0, 20);
	      break;

			// space
			case 32:
				// drop down when pressing space bar
				tetris.Piece.dropDown(ctx, buffer, buffer_ctx, tetromino);
				break;
			case 80:
				tetris.pausegame();
				break;
			case 82:
				tetris.restartgame();
				break;
	    default:
	      break;
	  }
	};
};
