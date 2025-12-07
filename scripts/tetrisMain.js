// 🎮 Setup canvas and rendering context
const tetrisCanvas = document.getElementById('tetrisCanvas');
const tetrisContext = tetrisCanvas.getContext('2d');

// Scale up blocks so each unit = 20px
tetrisContext.scale(20, 20);

// 🧹 Clear filled rows in the arena and update score
function arenaClear() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer; // Skip row if any empty cell
            }
        }

        // Remove filled row, add empty row at top
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        // Score increases with multiplier for consecutive clears
        player.score += rowCount * 10;
    }
}

// Example matrix (T piece)
const tetrisMatrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
];

// 🔍 Collision detection between player piece and arena
function collide(arena, player) {
    const m = player.tetrisMatrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// 🏗️ Create empty arena matrix (w = width, h = height)
function createTetrisMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// 🧩 Generate piece shapes by type
function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

// 🎨 Draw arena + player piece
function draw() {
  tetrisContext.fillStyle = '#000';
  tetrisContext.fillRect(0,0, tetrisCanvas.clientWidth, tetrisCanvas.height);
  drawTetrisMatrix(arena, {x: 0, y: 0});
  drawTetrisMatrix(player.tetrisMatrix, player.pos);
}

// Render a matrix (piece or arena) at given offset
function drawTetrisMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        tetrisContext.fillStyle = colors[value];
        tetrisContext.fillRect(x + offset.x,
                               y + offset.y, 
                               1, 1);
      }
    });
  });
}

// Merge player piece into arena when it lands
function merge(arena, player) {
  player.tetrisMatrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

// ⬇️ Drop piece down one step
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      playerReset();
      arenaClear();
      updateScore();
    }
    dropCounter = 0;
}

// ⬅️➡️ Move piece horizontally
function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

// 🔄 Reset player with new random piece
function playerReset() {
    const pieces = 'TJLOSZI';
    player.tetrisMatrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.tetrisMatrix[0].length / 2 | 0);
    // If new piece collides immediately → game over
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// ↩️ Rotate piece with wall kick logic
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.tetrisMatrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.tetrisMatrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// Matrix rotation (transpose + reverse)
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// ⏱️ Drop timing variables
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// 🎬 Game loop
function update(time = 0) {
  let deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

// 🏆 Update score display
function updateScore() {
  document.getElementById('score').innerText = player.score;
}

// 🏟️ Arena setup
const arena = createTetrisMatrix(12, 20);

// 👤 Player state
const player = {
  pos: {x: 0, y: 0},
  tetrisMatrix: null,
  score: 0
};

// 🎮 Keyboard controls
document.addEventListener('keydown', event => {
  if (event.code === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.code === 'ArrowRight') {
    playerMove(1);
  } else if (event.code === 'ArrowDown') {
    playerDrop();
  } else if (event.code === 'KeyQ') {
    playerRotate(-1);
  } else if (event.code === 'KeyW') {
    playerRotate(1);
  }
});

// 🎵 Audio controls
let gameAudio = new Audio('tetrisTheme.mp4');
function playGameAudio() {
  gameAudio.muted = false;
  if (typeof gameAudio.loop == 'boolean') {
      gameAudio.loop = true;
  } else {
      // Fallback for older browsers
      gameAudio.addEventListener('ended', function() {
          this.currentTime = 0;
          this.play();
      }, false);
  }
  gameAudio.play();
}
function muteGameAudio() {
  gameAudio.muted = true;
}

// 🎨 Piece colors
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

// 🚀 Start game
playerReset();
updateScore();
update();