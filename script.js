// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each grid box
const canvasSize = 400;
const gridSize = canvasSize / box;

// Game elements
let snake = [];
let food = {};
let score = 0;
let direction = '';
let nextDirection = '';
let gameInterval;
let gameSpeed;
let gameRunning = false;

// DOM elements
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const gameOverMessage = document.getElementById('gameOverMessage');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const levelSelect = document.getElementById('level');

// Speed settings for different levels (milliseconds between moves)
const speeds = {
    easy: 150,
    medium: 100,
    hard: 70
};

// Initialize the game
function init() {
    // Create initial snake
    snake = [
        { x: 10 * box, y: 10 * box },
        { x: 9 * box, y: 10 * box },
        { x: 8 * box, y: 10 * box }
    ];
    
    // Initial direction
    direction = 'right';
    nextDirection = 'right';
    
    // Reset score
    score = 0;
    scoreDisplay.textContent = score;
    
    // Set game speed based on selected level
    gameSpeed = speeds[levelSelect.value];
    
    // Generate initial food
    placeFood();
    
    // Clear any existing interval
    clearInterval(gameInterval);
    
    // Draw initial state
    drawGame();
}

// Place food at random position
function placeFood() {
    // Generate random coordinates
    let foodX, foodY;
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * (gridSize - 2) + 1) * box;
        foodY = Math.floor(Math.random() * (gridSize - 2) + 1) * box;
        
        // Check if the food is not on the snake
        validPosition = true;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = {
        x: foodX,
        y: foodY
    };
}

// Draw the game state
function drawGame() {
    // Clear the canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#4CAF50' : '#2E7D32'; // Head is lighter green
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        
        // Add border to snake segments
        ctx.strokeStyle = '#111';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }
    
    // Draw food
    ctx.fillStyle = '#F44336'; // Red food
    ctx.beginPath();
    ctx.arc(food.x + box/2, food.y + box/2, box/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw grid (optional, for better visualization)
    ctx.strokeStyle = '#222';
    for (let i = 0; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * box, 0);
        ctx.lineTo(i * box, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * box);
        ctx.lineTo(canvas.width, i * box);
        ctx.stroke();
    }
}

// Update snake position
function moveSnake() {
    // Apply the next direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { x: snake[0].x, y: snake[0].y };
    
    switch (direction) {
        case 'up':
            head.y -= box;
            break;
        case 'down':
            head.y += box;
            break;
        case 'left':
            head.x -= box;
            break;
        case 'right':
            head.x += box;
            break;
    }
    
    // Check for collisions
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head to the snake
    snake.unshift(head);
    
    // Check if snake ate the food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreDisplay.textContent = score;
        
        // Generate new food
        placeFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
    
    // Redraw the game
    drawGame();
}

// Check for collisions with walls or self
function checkCollision(head) {
    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    
    // Check self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Handle game over
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverMessage.classList.remove('hidden');
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    // Initialize game state
    init();
    
    // Hide game over message if visible
    gameOverMessage.classList.add('hidden');
    
    // Start game loop
    gameInterval = setInterval(moveSnake, gameSpeed);
    gameRunning = true;
    
    // Update button states
    startBtn.disabled = true;
    stopBtn.disabled = false;
    levelSelect.disabled = true;
}

// Stop the game
function stopGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    levelSelect.disabled = false;
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning) return;
    
    // Prevent the default action (scrolling) when pressing arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) > -1) {
        e.preventDefault();
    }
    
    // Arrow keys for direction
    switch (e.key) {
        case "ArrowUp":
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case "ArrowDown":
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case "ArrowLeft":
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case "ArrowRight":
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case " ": // Space bar to pause/resume
            if (gameRunning) {
                stopGame();
            } else {
                startGame();
            }
            break;
    }
}

// Event listeners
document.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
restartBtn.addEventListener('click', startGame);

// Change level
levelSelect.addEventListener('change', function() {
    gameSpeed = speeds[this.value];
    if (gameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, gameSpeed);
    }
});

// Draw initial empty game board
drawGame();