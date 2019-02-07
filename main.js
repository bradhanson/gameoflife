function Board(width, height, pieceSize) {
  this.width = width;
  this.height = height;
  this.pieceSize = pieceSize; // in pixels
  this.generation = 0;
  this.board = [];

  // Initialize 2d board to all zeros
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(0);
    }
    this.board[y] = row;
  }
}

Board.prototype.spawn = function(x, y) {
  this.board[y][x] = 1;
};

Board.prototype.kill = function(x, y) {
  this.board[y][x] = 0;
};

Board.prototype.print = function(context) {
  context.canvas.width = this.width * this.pieceSize + 3;
  context.canvas.height = this.height * this.pieceSize + 3;

  // draw border
  context.strokeRect(0, 0, context.canvas.width, context.canvas.height);

  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      if (this.board[y][x] === 1) {
        context.fillRect(
          x * this.pieceSize + 2,
          y * this.pieceSize + 2,
          this.pieceSize - 1,
          this.pieceSize - 1
        );
      }
    }
  }
};

// Toroidal Array
// https://en.wikipedia.org/wiki/Torus
Board.prototype.getRelativeCoordsToroidal = function(x, y, deltaX, deltaY) {
  let tempX = x + deltaX;
  let tempY = y + deltaY;

  tempX = mod(tempX, this.width);
  tempY = mod(tempY, this.width);

  return [tempX, tempY];

  function mod(n, m) {
    return ((n % m) + m) % m;
  }
};

Board.prototype.getLiveNeighbors = function(x, y) {
  let liveNeighbors = 0;

  let testX = 0;
  let testY = 0;

  // north
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, 0, -1);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // south
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, 0, 1);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // east
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, 1, 0);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // west
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, -1, 0);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // northeast
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, 1, -1);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // southeast
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, 1, 1);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // northwest
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, -1, -1);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  // southwest
  [testX, testY] = this.getRelativeCoordsToroidal(x, y, -1, 1);
  if (this.board[testY][testX] === 1) {
    liveNeighbors++;
  }

  return liveNeighbors;
};

Board.prototype.tick = function() {
  const newBoard = this.clone();

  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      const liveNeighbors = this.getLiveNeighbors(x, y);

      if (this.board[y][x] === 1) {
        // alive
        if (liveNeighbors < 2) {
          // dies
          newBoard.kill(x, y);
        } else if (liveNeighbors === 2 || liveNeighbors === 3) {
          // lives
          newBoard.spawn(x, y);
        } else {
          // dies
          newBoard.kill(x, y);
        }
      } else {
        // dead
        if (liveNeighbors === 3) {
          newBoard.spawn(x, y);
        }
      }
    }
  }

  this.board = newBoard.board;
  this.generation++;
};

Board.prototype.clone = function() {
  const board = new Board(this.width, this.height, this.pieceSize);

  // Copy board state
  for (let y = 0; y < this.height; y++) {
    const row = [];
    for (let x = 0; x < this.width; x++) {
      row.push(this.board[y][x]);
    }
    board[y] = row;
  }

  return board;
};

const canvas = document.getElementById("game");
if (canvas.getContext) {
  const context = canvas.getContext("2d");

  const board = new Board(70, 70, 8);

  // seed
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const num = Math.random();
      if (num < 0.4) {
        board.spawn(y, x);
      }
    }
  }

  board.print(context);

  //window.setTimeout(doTick, 100);
  //doTick();

  let timeoutId;

  function doTick() {
    board.tick();
    board.print(context);
    document.getElementById("generation").value = board.generation;

    const delay = document.getElementById("delay").value;

    timeoutId = window.setTimeout(doTick, delay);
  }

  function stopTick() {
    window.clearTimeout(timeoutId);
  }

  let running = false;

  const toggle = document.getElementById("toggle");
  toggle.addEventListener("click", event => {
    if (running) {
      stopTick();
      running = false;
      toggle.value = "Start";
    } else {
      doTick();
      running = true;
      toggle.value = "Stop";
    }
  });
}
