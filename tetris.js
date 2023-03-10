// Récupérer le canvas et son contexte 2D
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

// Définir le nombre de rangées et de colonnes du jeu, ainsi que la taille d'un bloc
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// Définir la taille du canvas en fonction du nombre de colonnes et de rangées
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Définir les couleurs disponibles pour les blocs
const COLORS = [
    '#000000',  // noir
    '#FF0000',  // rouge
    '#00FF00',  // vert
    '#0000FF',  // bleu
    '#FFFF00',  // jaune
    '#FF00FF',  // magenta
    '#00FFFF'   // cyan
];


const shapes = [
    [],
    [[0, 0], [0, 1], [1, 0], [1, 1]], // Carré
    [[0, 0], [0, 1], [0, 2], [0, 3]], // Ligne
    [[0, 0], [0, 1], [0, 2], [1, 2]], // L
    [[1, 0], [1, 1], [1, 2], [0, 2]], // L inversé
    [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
    [[0, 1], [1, 1], [1, 0], [2, 0]], // Z inversé
    [[0, 0], [1, 0], [2, 0], [1, 1]]  // T
];

// Paramétrer les blocs
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#222222';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Définir le tableau à 2 dimensions
let board = [];
for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
        board[r][c] = 0;
    }
}

// Paramétrer le tableau
function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawBlock(c, r, COLORS[board[r][c]]);
        }
    }
}

let currentShape = {
    x: 0,
    y: 0,
    shape: shapes[1],
    color: 1
};

function drawShape() {
    for (let i = 0; i < currentShape.shape.length; i++) {
        let x = currentShape.x + currentShape.shape[i][0];
        let y = currentShape.y + currentShape.shape[i][1];
        drawBlock(x, y, COLORS[currentShape.color]);
    }
}

function eraseShape() {
    for (let i = 0; i < currentShape.shape.length; i++) {
        let x = currentShape.x + currentShape.shape[i][0];
        let y = currentShape.y + currentShape.shape[i][1];
        drawBlock(x, y, '#FFFFFF');
    }
}

function isValidMove(dx, dy, newShape) {
    for (let i = 0; i < newShape.length; i++) {
        let x = currentShape.x + newShape[i][0] + dx;
        let y = currentShape.y + newShape[i][1] + dy;
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS || board[y][x]) {
            return false;
        }
    }
    return true;
}

function placeShape() {
    for (let i = 0; i < currentShape.shape.length; i++) {
        let x = currentShape.x + currentShape.shape[i][0];
        let y = currentShape.y + currentShape.shape[i][1];
        board[y][x] = currentShape.color;
    }
}

function checkRows() {
    let fullRows = [];
    for (let r = 0; r < ROWS; r++) {
        let isFull = true;
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 0) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            fullRows.unshift(r);
        }
    }
    for (let i = 0; i < fullRows.length; i++) {
        board.splice(fullRows[i], 1);
        board.unshift(new Array(COLS).fill(0));
    }
}

function newShape() {
    let shapeId = Math.floor(Math.random() * (shapes.length - 1)) + 1;
    currentShape.shape = shapes[shapeId];
    currentShape.color = shapeId;
    currentShape.x = Math.floor(Math.random() * (COLS - currentShape.shape[0].length));
    currentShape.y = 0;
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    let deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        dropShape();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard();
    drawShape();

    requestAnimationFrame(update);
}

function dropShape() {
    eraseShape();
    if (isValidMove(0, 1, currentShape.shape)) {
        currentShape.y++;
    } else {
        placeShape();
        checkRows();
        newShape();
    }
    dropCounter = 0;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // left arrow
        if (isValidMove(-1, 0, currentShape.shape)) {
            eraseShape();
            currentShape.x--;
            drawShape();
        }
    } else if (event.keyCode === 39) { // right arrow
        if (isValidMove(1, 0, currentShape.shape)) {
            eraseShape();
            currentShape.x++;
            drawShape();
        }
    } else if (event.keyCode === 40) { // down arrow
        dropShape();
    } else if (event.keyCode === 38) { // up arrow
        eraseShape();
        let newShape = rotateShape(currentShape.shape);
        if (isValidMove(0, 0, newShape)) {
            currentShape.shape = newShape;
        }
        drawShape();
    }
});

function rotateShape(shape) {
    let newShape = [];
    for (let i = 0; i < shape.length; i++) {
        let x = shape[i][0];
        let y = shape[i][1];
        newShape.push([-y, x]);
    }
    return newShape;
}

newShape();
update();