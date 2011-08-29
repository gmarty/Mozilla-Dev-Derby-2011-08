/**
@preserve This demo is my submission to the Mozilla Dev Derby of August 2011.
This is basically a Tetris integrated into the browser UI. The next piece shape is listed in the URL bar, your score is in the title bar and hover the page to display instructions (yeah, I know, this one in annoying...).
I've used the History API to display useful information about the game. Browser's back/next buttons are unused.
Enter a harder mode by pressing F11 ;-)

The code is available at https://github.com/gmarty/Mozilla-Dev-Derby-2011-08

This demo is built using several open source projects:

* Tetris game (https://github.com/Rayomnd/tetrisgame) by Daihua Ye
* Closure Library (http://code.google.com/closure/library/)

Follow me on Twitter: https://twitter.com/g_marty

-----

Original copyright of Tetris game by Daihua Ye:

Copyright (c) 2010, Daihua Ye
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions may not be sold, nor may they be used in a commercial
  product or activity.

* Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

goog.provide('tetris');

goog.require('goog.dom');
goog.require('tetris.Board');
goog.require('tetris.Piece');


/**
 * @define {boolean}
 */
var DEBUG = true;

var buffer;
var canvas;
var titleEl;

var pauseMe;

var blockImg;

var gameOver;
var pauseScene;

var buffer_ctx;
var ctx;

//var preview_ctx;
// var previewTemp_ctx;
var tetromino;
var nextTetromino;
var projection;

// var blockImg = new Image();
// BrowserDetect.init();
// ctx.drawImage(blockImg, 0, 0);

tetris.intervalInt = {
  i: 0
};
tetris.keyCode = {
  key: 0
};
tetris.Score = {
  score: 0, allScores: []
};
tetris.Level = {
  level: 1
};
tetris.blocks = [];
tetris.isEnd = {
  end: false
};
// tetris.rowsCleared = { num : 0, completedRows: [] };
tetris.rowsCleared = {
  num: 0
};
tetris.gameSpeed = {
  num: 800
};
tetris.blockInfo = function() {
  this.isBlocked = false;
  this.color = 0;
};



/**
 * @constructor
 */
tetris.Tetromino = function() {
	this.pattern = 0;
	this.rotation = 0;
  //	this.location = 0;
	this.x = 0;
	this.y = 0;
};

tetris.resetblocks = function() {
	var row, col;
	for (row = 0; row <= tetris.Board.HEIGHT; row++) {
		for (col = 0; col <= tetris.Board.WIDTH; col++) {
			if (tetris.blocks[row * tetris.Board.WIDTH + col] === undefined)
				// buffer_ctx.fillRect(col*20, row*20, 20, 20);
				var blockInfo = new tetris.blockInfo();
				tetris.blocks[row * tetris.Board.WIDTH + col] = blockInfo;
		}
	}
};

tetris.pausegame = function() {
	if (pauseMe === 'Pause Game') {
		pauseMe = 'Start Game';
		pauseScene.innerHTML = 'Pause';
		document.onkeydown = function(event) {
			var keyCode;

		  if (event === null) {
		    keyCode = window.event.keyCode;
		  } else {
		    keyCode = event.keyCode;
		  }
			// console.log(keyCode);
		  if (keyCode === 80) {
				pauseMe = 'Pause Game';
				tetris.Board.isEnd();
				if (tetris.isEnd.end === false) {
					tetris.intervalInt.i = setInterval(function() {
            tetris.Piece.move(ctx, buffer, buffer_ctx, tetromino);
          }, tetris.gameSpeed.num);
				}
				pauseScene.innerHTML = '';
			} else if (keyCode === 82) {
				tetris.restartgame();
			}
		};

		clearInterval(tetris.intervalInt.i);
	} else {
		pauseMe = 'Pause Game';
		tetris.Board.isEnd();
		if (tetris.isEnd.end === false) {
			tetris.intervalInt.i = setInterval(function() {
        tetris.Piece.move(ctx, buffer, buffer_ctx, tetromino);
      }, tetris.gameSpeed.num);
		}
		pauseScene.innerHTML = '';
	}
};

tetris.restartgame = function() {
	// setup the default value
  buffer = goog.dom.getElement('canvas');
  canvas = goog.dom.getElement('visible-canvas');
  titleEl = goog.dom.getElementsByTagNameAndClass('title')[0];

  pauseMe = 'Pause Game';

  blockImg = goog.dom.getElement('blockimg');

  gameOver = goog.dom.getElement('gameover');
  pauseScene = goog.dom.getElement('pausescene');

  buffer_ctx = buffer.getContext('2d');
  ctx = canvas.getContext('2d');

  tetromino = new tetris.Tetromino();
  nextTetromino = new tetris.Tetromino();
  projection = new tetris.Tetromino();

	tetris.keyCode.key = 0;
	tetris.Score.score = 0;
	tetris.Level.level = 1;
	tetris.rowsCleared.num = 0;
	tetris.gameSpeed.num = 800;
	tetris.Score.allScores = [];
	tetris.isEnd.end = false;
	tetris.cannotMove = false;
	gameOver.innerHTML = '';
	pauseScene.innerHTML = '';
	tetris.blocks = [];

	// reset the blocks
	tetris.resetblocks();

	// Update the <title> tag.
	tetris.Board.updateTitle();

	// clear the projection
	tetris.Piece.drawProjection(ctx, buffer, buffer_ctx, projection, 'white');

	// redraw the game
	tetris.Piece.redraw(ctx, buffer, buffer_ctx);

	// create a new piece and start
	// var tetromino = new tetris.Tetromino();
	tetris.Piece.startTetromino(tetromino);

	// copy the tetromino to projection
	tetris.Piece.copy(tetromino, projection);
	// start the game

	// show the next piece
	tetris.Board.showNextPiece();

	clearInterval(tetris.intervalInt.i);
	tetris.intervalInt.i = setInterval(function() {
    tetris.Piece.move(ctx, buffer, buffer_ctx, tetromino);
  }, tetris.gameSpeed.num);
};

window['tetris'] = tetris;
window['tetris']['restartgame'] = tetris.restartgame;
