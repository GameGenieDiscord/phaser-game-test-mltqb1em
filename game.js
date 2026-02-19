// Snake Game - Phaser.js

let snake, food, cursors;
let score = 0;
let scoreText;
let gameOver = false;
let gameOverText;
let restartText;
let lastMoveTime = 0;
let moveDelay = 150;
let direction = 'right';
let nextDirection = 'right';

function preload() {
    // Create simple textures programmatically
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Snake head texture
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('snake_head', 20, 20);
    
    // Snake body texture
    graphics.clear();
    graphics.fillStyle(0x00cc00);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('snake_body', 20, 20);
    
    // Food texture
    graphics.clear();
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(10, 10, 8);
    graphics.generateTexture('food', 20, 20);
}

function create() {
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Create snake group
    snake = this.add.group();
    
    // Create initial snake (3 segments)
    for (let i = 0; i < 3; i++) {
        const segment = this.add.rectangle(200 - i * 20, 300, 20, 20, 0x00ff00);
        if (i === 0) {
            segment.setFillStyle(0x00ff00); // Head
        } else {
            segment.setFillStyle(0x00cc00); // Body
        }
        snake.add(segment);
    }
    
    // Create food
    food = this.add.rectangle(400, 300, 20, 20, 0xff0000);
    food.setStrokeStyle(2, 0xffffff);
    
    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    });
    
    // Game over text (hidden initially)
    gameOverText = this.add.text(400, 250, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Arial',
        align: 'center'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);
    
    restartText = this.add.text(400, 320, 'Press SPACE to restart', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center'
    });
    restartText.setOrigin(0.5);
    restartText.setVisible(false);
    
    // Controls
    cursors = this.input.keyboard.createCursorKeys();
    
    // Space key for restart
    this.input.keyboard.on('keydown-SPACE', () => {
        if (gameOver) {
            this.scene.restart();
        }
    });
}

function update(time) {
    if (gameOver) return;
    
    // Handle input for next direction
    if (cursors.left.isDown && direction !== 'right') {
        nextDirection = 'left';
    } else if (cursors.right.isDown && direction !== 'left') {
        nextDirection = 'right';
    } else if (cursors.up.isDown && direction !== 'down') {
        nextDirection = 'up';
    } else if (cursors.down.isDown && direction !== 'up') {
        nextDirection = 'down';
    }
    
    // Move snake based on time delay
    if (time - lastMoveTime > moveDelay) {
        direction = nextDirection;
        moveSnake.call(this);
        lastMoveTime = time;
    }
}

function moveSnake() {
    const snakeSegments = snake.getChildren();
    const head = snakeSegments[0];
    
    // Calculate new head position
    let newX = head.x;
    let newY = head.y;
    
    switch (direction) {
        case 'left':
            newX -= 20;
            break;
        case 'right':
            newX += 20;
            break;
        case 'up':
            newY -= 20;
            break;
        case 'down':
            newY += 20;
            break;
    }
    
    // Check wall collision
    if (newX < 10 || newX > 790 || newY < 10 || newY > 590) {
        endGame.call(this);
        return;
    }
    
    // Check self collision
    for (let segment of snakeSegments) {
        if (Math.abs(segment.x - newX) < 10 && Math.abs(segment.y - newY) < 10) {
            endGame.call(this);
            return;
        }
    }
    
    // Move body segments
    for (let i = snakeSegments.length - 1; i > 0; i--) {
        snakeSegments[i].x = snakeSegments[i - 1].x;
        snakeSegments[i].y = snakeSegments[i - 1].y;
    }
    
    // Move head
    head.x = newX;
    head.y = newY;
    
    // Check food collision
    if (Math.abs(head.x - food.x) < 15 && Math.abs(head.y - food.y) < 15) {
        eatFood.call(this);
    }
}

function eatFood() {
    // Increase score
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Add new segment to snake
    const tail = snake.getChildren()[snake.getChildren().length - 1];
    const newSegment = this.add.rectangle(tail.x, tail.y, 20, 20, 0x00cc00);
    snake.add(newSegment);
    
    // Move food to new random position
    let newFoodX, newFoodY;
    let validPosition = false;
    
    while (!validPosition) {
        newFoodX = Phaser.Math.Between(20, 780);
        newFoodY = Phaser.Math.Between(20, 580);
        
        // Round to grid
        newFoodX = Math.round(newFoodX / 20) * 20;
        newFoodY = Math.round(newFoodY / 20) * 20;
        
        // Check if position is not occupied by snake
        validPosition = true;
        for (let segment of snake.getChildren()) {
            if (Math.abs(segment.x - newFoodX) < 20 && Math.abs(segment.y - newFoodY) < 20) {
                validPosition = false;
                break;
            }
        }
    }
    
    food.x = newFoodX;
    food.y = newFoodY;
    
    // Increase speed slightly
    moveDelay = Math.max(100, moveDelay - 2);
}

function endGame() {
    gameOver = true;
    gameOverText.setVisible(true);
    restartText.setVisible(true);
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize game
const game = new Phaser.Game(config);