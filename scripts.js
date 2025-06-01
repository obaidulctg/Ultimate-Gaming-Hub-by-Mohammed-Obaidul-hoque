        // Game State Management
        let currentGame = null;

        function startGame(gameType) {
            currentGame = gameType;
            document.getElementById('gameSelection').style.display = 'none';
            document.getElementById(gameType + 'Game').classList.add('active');
            
            switch(gameType) {
                case 'snake':
                    initSnake();
                    break;
                case 'tictactoe':
                    initTicTacToe();
                    break;
                case 'memory':
                    initMemory();
                    break;
                case 'pong':
                    initPong();
                    break;
                case 'tetris':
                    initTetris();
                    break;
                case 'simon':
                    initSimon();
                    break;
                case 'rps':
                    initRPS();
                    break;
                case 'hangman':
                    initHangman();
                    break;
            }
        }

        function backToMenu() {
            document.querySelectorAll('.game-area').forEach(area => {
                area.classList.remove('active');
            });
            document.getElementById('gameSelection').style.display = 'grid';
            currentGame = null;
            
            // Stop all game intervals
            if (window.snakeInterval) clearInterval(window.snakeInterval);
            if (window.pongInterval) clearInterval(window.pongInterval);
            if (window.tetrisInterval) clearInterval(window.tetrisInterval);
            if (window.simonTimeout) clearTimeout(window.simonTimeout);
        }

        // Snake Game
        let snake, food, dx, dy, score;
        
        function initSnake() {
            const canvas = document.getElementById('snakeCanvas');
            const ctx = canvas.getContext('2d');
            
            snake = [{x: 200, y: 200}];
            food = {x: 0, y: 0};
            dx = 20;
            dy = 0;
            score = 0;
            
            generateFood();
            updateSnakeScore();
            
            if (window.snakeInterval) clearInterval(window.snakeInterval);
            window.snakeInterval = setInterval(gameLoop, 150);
            
            document.addEventListener('keydown', handleSnakeInput);
        }
        
        function generateFood() {
            food.x = Math.floor(Math.random() * 20) * 20;
            food.y = Math.floor(Math.random() * 20) * 20;
        }
        
        function gameLoop() {
            const canvas = document.getElementById('snakeCanvas');
            const ctx = canvas.getContext('2d');
            
            // Move snake
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            // Check walls
            if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
                gameOver();
                return;
            }
            
            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Check food
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                updateSnakeScore();
                generateFood();
            } else {
                snake.pop();
            }
            
            // Draw everything
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 400, 400);
            
            // Draw snake
            ctx.fillStyle = '#0f0';
            snake.forEach(segment => {
                ctx.fillRect(segment.x, segment.y, 18, 18);
            });
            
            // Draw food
            ctx.fillStyle = '#f00';
            ctx.fillRect(food.x, food.y, 18, 18);
        }
        
        function handleSnakeInput(e) {
            if (currentGame !== 'snake') return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (dy === 0) { dx = 0; dy = -20; }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (dy === 0) { dx = 0; dy = 20; }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (dx === 0) { dx = -20; dy = 0; }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (dx === 0) { dx = 20; dy = 0; }
                    break;
            }
        }
        
        function gameOver() {
            clearInterval(window.snakeInterval);
            alert(`Game Over! Final Score: ${score}`);
        }
        
        function updateSnakeScore() {
            document.getElementById('snakeScore').textContent = score;
        }

        // Tic Tac Toe Game
        let tttBoard, currentPlayer, gameActive;
        
        function initTicTacToe() {
            tttBoard = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            
            document.getElementById('currentPlayer').textContent = currentPlayer;
            document.getElementById('tttResult').textContent = '';
            
            const boardElement = document.getElementById('tttBoard');
            boardElement.innerHTML = '';
            
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.className = 'ttt-cell';
                cell.onclick = () => makeMove(i);
                boardElement.appendChild(cell);
            }
        }
        
        function makeMove(index) {
            if (tttBoard[index] !== '' || !gameActive) return;
            
            tttBoard[index] = currentPlayer;
            updateTicTacToeDisplay();
            
            if (checkWinner()) {
                document.getElementById('tttResult').textContent = `Player ${currentPlayer} wins!`;
                gameActive = false;
                return;
            }
            
            if (tttBoard.every(cell => cell !== '')) {
                document.getElementById('tttResult').textContent = "It's a tie!";
                gameActive = false;
                return;
            }
            
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            document.getElementById('currentPlayer').textContent = currentPlayer;
        }
        
        function updateTicTacToeDisplay() {
            const cells = document.querySelectorAll('.ttt-cell');
            cells.forEach((cell, index) => {
                cell.textContent = tttBoard[index];
                cell.className = `ttt-cell ${tttBoard[index].toLowerCase()}`;
                if (tttBoard[index] !== '') {
                    cell.classList.add('filled');
                }
            });
        }
        
        function checkWinner() {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6] // diagonals
            ];
            
            return winPatterns.some(pattern => 
                pattern.every(index => 
                    tttBoard[index] === currentPlayer && tttBoard[index] !== ''
                )
            );
        }
        
        function resetTicTacToe() {
            initTicTacToe();
        }

        // Memory Game
        let memoryCards, flippedCards, matchedPairs, moves;
        const cardSymbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎵', '🚀'];
        
        function initMemory() {
            memoryCards = [...cardSymbols, ...cardSymbols].sort(() => Math.random() - 0.5);
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            
            updateMemoryDisplay();
            
            const boardElement = document.getElementById('memoryBoard');
            boardElement.innerHTML = '';
            
            memoryCards.forEach((symbol, index) => {
                const card = document.createElement('button');
                card.className = 'memory-card';
                card.textContent = '?';
                card.onclick = () => flipCard(index);
                boardElement.appendChild(card);
            });
        }
        
        function flipCard(index) {
            const cards = document.querySelectorAll('.memory-card');
            const card = cards[index];
            
            if (flippedCards.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
                return;
            }
            
            card.classList.add('flipped');
            card.textContent = memoryCards[index];
            flippedCards.push({index, symbol: memoryCards[index]});
            
            if (flippedCards.length === 2) {
                moves++;
                updateMemoryDisplay();
                
                setTimeout(() => {
                    checkMemoryMatch();
                }, 1000);
            }
        }
        
        function checkMemoryMatch() {
            const cards = document.querySelectorAll('.memory-card');
            const [first, second] = flippedCards;
            
            if (first.symbol === second.symbol) {
                cards[first.index].classList.add('matched');
                cards[second.index].classList.add('matched');
                matchedPairs++;
                
                if (matchedPairs === 8) {
                    document.getElementById('memoryResult').textContent = `Congratulations! You won in ${moves} moves!`;
                }
            } else {
                cards[first.index].classList.remove('flipped');
                cards[second.index].classList.remove('flipped');
                cards[first.index].textContent = '?';
                cards[second.index].textContent = '?';
            }
            
            flippedCards = [];
            updateMemoryDisplay();
        }
        
        function updateMemoryDisplay() {
            document.getElementById('moves').textContent = moves;
            document.getElementById('matches').textContent = matchedPairs;
        }
        
        function resetMemory() {
            document.getElementById('memoryResult').textContent = '';
            initMemory();
        }

        // Pong Game
        let pong = {};
        
        function initPong() {
            const canvas = document.getElementById('pongCanvas');
            const ctx = canvas.getContext('2d');
            
            pong = {
                ball: { x: 300, y: 150, dx: 4, dy: 4, radius: 8 },
                player: { x: 10, y: 125, width: 10, height: 50, dy: 0 },
                computer: { x: 580, y: 125, width: 10, height: 50, dy: 0 },
                playerScore: 0,
                computerScore: 0
            };
            
            updatePongScore();
            
            if (window.pongInterval) clearInterval(window.pongInterval);
            window.pongInterval = setInterval(pongGameLoop, 16);
            
            document.addEventListener('keydown', handlePongInput);
            document.addEventListener('keyup', handlePongInputUp);
        }
        
        function pongGameLoop() {
            const canvas = document.getElementById('pongCanvas');
            const ctx = canvas.getContext('2d');
            
            // Move player paddle
            pong.player.y += pong.player.dy;
            if (pong.player.y < 0) pong.player.y = 0;
            if (pong.player.y + pong.player.height > 300) pong.player.y = 300 - pong.player.height;
            
            // Move computer paddle (AI)
            const computerCenter = pong.computer.y + pong.computer.height / 2;
            if (computerCenter < pong.ball.y - 35) {
                pong.computer.y += 3;
            } else if (computerCenter > pong.ball.y + 35) {
                pong.computer.y -= 3;
            }
            
            // Move ball
            pong.ball.x += pong.ball.dx;
            pong.ball.y += pong.ball.dy;
            
            // Ball collision with top/bottom walls
            if (pong.ball.y <= pong.ball.radius || pong.ball.y >= 300 - pong.ball.radius) {
                pong.ball.dy = -pong.ball.dy;
            }
            
            // Ball collision with paddles
            if (pong.ball.x <= pong.player.x + pong.player.width && 
                pong.ball.y >= pong.player.y && 
                pong.ball.y <= pong.player.y + pong.player.height) {
                pong.ball.dx = -pong.ball.dx;
                pong.ball.x = pong.player.x + pong.player.width + pong.ball.radius;
            }
            
            if (pong.ball.x >= pong.computer.x - pong.ball.radius && 
                pong.ball.y >= pong.computer.y && 
                pong.ball.y <= pong.computer.y + pong.computer.height) {
                pong.ball.dx = -pong.ball.dx;
                pong.ball.x = pong.computer.x - pong.ball.radius;
            }
            
            // Score
            if (pong.ball.x < 0) {
                pong.computerScore++;
                resetBall();
            } else if (pong.ball.x > 600) {
                pong.playerScore++;
                resetBall();
            }
            
            // Draw everything
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 600, 300);
            
            // Draw paddles
            ctx.fillStyle = '#fff';
            ctx.fillRect(pong.player.x, pong.player.y, pong.player.width, pong.player.height);
            ctx.fillRect(pong.computer.x, pong.computer.y, pong.computer.width, pong.computer.height);
            
            // Draw ball
            ctx.beginPath();
            ctx.arc(pong.ball.x, pong.ball.y, pong.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw center line
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.moveTo(300, 0);
            ctx.lineTo(300, 300);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        function resetBall() {
            pong.ball.x = 300;
            pong.ball.y = 150;
            pong.ball.dx = -pong.ball.dx;
            updatePongScore();
        }
        
        function handlePongInput(e) {
            if (currentGame !== 'pong') return;
            
            switch(e.key) {
                case 'ArrowUp':
                    pong.player.dy = -5;
                    break;
                case 'ArrowDown':
                    pong.player.dy = 5;
                    break;
            }
        }
        
        function handlePongInputUp(e) {
            if (currentGame !== 'pong') return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    pong.player.dy = 0;
                    break;
            }
        }
        
        function updatePongScore() {
            document.getElementById('playerScore').textContent = pong.playerScore;
            document.getElementById('computerScore').textContent = pong.computerScore;
        }

        // Tetris Game
        let tetris = {};
        const TETRIS_COLORS = ['#000', '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
        const TETRIS_PIECES = [
            [[[1,1,1,1]]],
            [[[1,1],[1,1]]],
            [[[0,1,0],[1,1,1]]],
            [[[0,1,1],[1,1,0]]],
            [[[1,1,0],[0,1,1]]],
            [[[1,0,0],[1,1,1]]],
            [[[0,0,1],[1,1,1]]]
        ];
        
        function initTetris() {
            const canvas = document.getElementById('tetrisCanvas');
            const ctx = canvas.getContext('2d');
            
            tetris = {
                board: Array(20).fill().map(() => Array(10).fill(0)),
                currentPiece: null,
                currentX: 0,
                currentY: 0,
                score: 0,
                lines: 0,
                level: 1,
                dropCounter: 0,
                dropInterval: 1000
            };
            
            spawnPiece();
            updateTetrisDisplay();
            
            if (window.tetrisInterval) clearInterval(window.tetrisInterval);
            window.tetrisInterval = setInterval(tetrisGameLoop, 50);
            
            document.addEventListener('keydown', handleTetrisInput);
        }
        
        function spawnPiece() {
            const pieceIndex = Math.floor(Math.random() * TETRIS_PIECES.length);
            tetris.currentPiece = TETRIS_PIECES[pieceIndex][0];
            tetris.currentX = Math.floor((10 - tetris.currentPiece[0].length) / 2);
            tetris.currentY = 0;
            tetris.pieceColor = pieceIndex + 1;
            
            if (checkCollision()) {
                // Game over
                clearInterval(window.tetrisInterval);
                alert(`Game Over! Final Score: ${tetris.score}`);
            }
        }
        
        function tetrisGameLoop() {
            tetris.dropCounter += 50;
            
            if (tetris.dropCounter >= tetris.dropInterval) {
                tetris.dropCounter = 0;
                dropPiece();
            }
            
            drawTetris();
        }
        
        function dropPiece() {
            tetris.currentY++;
            if (checkCollision()) {
                tetris.currentY--;
                placePiece();
                clearLines();
                spawnPiece();
            }
        }
        
        function placePiece() {
            for (let y = 0; y < tetris.currentPiece.length; y++) {
                for (let x = 0; x < tetris.currentPiece[y].length; x++) {
                    if (tetris.currentPiece[y][x]) {
                        tetris.board[tetris.currentY + y][tetris.currentX + x] = tetris.pieceColor;
                    }
                }
            }
        }
        
        function clearLines() {
            let linesCleared = 0;
            for (let y = tetris.board.length - 1; y >= 0; y--) {
                if (tetris.board[y].every(cell => cell !== 0)) {
                    tetris.board.splice(y, 1);
                    tetris.board.unshift(Array(10).fill(0));
                    linesCleared++;
                    y++;
                }
            }
            
            if (linesCleared > 0) {
                tetris.lines += linesCleared;
                tetris.score += linesCleared * 100 * tetris.level;
                tetris.level = Math.floor(tetris.lines / 10) + 1;
                tetris.dropInterval = Math.max(100, 1000 - (tetris.level - 1) * 100);
                updateTetrisDisplay();
            }
        }
        
        function checkCollision() {
            for (let y = 0; y < tetris.currentPiece.length; y++) {
                for (let x = 0; x < tetris.currentPiece[y].length; x++) {
                    if (tetris.currentPiece[y][x]) {
                        const newX = tetris.currentX + x;
                        const newY = tetris.currentY + y;
                        
                        if (newX < 0 || newX >= 10 || newY >= 20) {
                            return true;
                        }
                        
                        if (newY >= 0 && tetris.board[newY][newX]) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        
        function rotatePiece() {
            const rotated = tetris.currentPiece[0].map((_, i) => 
                tetris.currentPiece.map(row => row[i]).reverse()
            );
            
            const originalPiece = tetris.currentPiece;
            tetris.currentPiece = rotated;
            
            if (checkCollision()) {
                tetris.currentPiece = originalPiece;
            }
        }
        
        function drawTetris() {
            const canvas = document.getElementById('tetrisCanvas');
            const ctx = canvas.getContext('2d');
            const blockSize = 30;
            
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 300, 600);
            
            // Draw board
            for (let y = 0; y < tetris.board.length; y++) {
                for (let x = 0; x < tetris.board[y].length; x++) {
                    if (tetris.board[y][x]) {
                        ctx.fillStyle = TETRIS_COLORS[tetris.board[y][x]];
                        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                        ctx.strokeStyle = '#fff';
                        ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
                    }
                }
            }
            
            // Draw current piece
            if (tetris.currentPiece) {
                ctx.fillStyle = TETRIS_COLORS[tetris.pieceColor];
                for (let y = 0; y < tetris.currentPiece.length; y++) {
                    for (let x = 0; x < tetris.currentPiece[y].length; x++) {
                        if (tetris.currentPiece[y][x]) {
                            ctx.fillRect(
                                (tetris.currentX + x) * blockSize,
                                (tetris.currentY + y) * blockSize,
                                blockSize,
                                blockSize
                            );
                            ctx.strokeStyle = '#fff';
                            ctx.strokeRect(
                                (tetris.currentX + x) * blockSize,
                                (tetris.currentY + y) * blockSize,
                                blockSize,
                                blockSize
                            );
                        }
                    }
                }
            }
        }
        
        function handleTetrisInput(e) {
            if (currentGame !== 'tetris') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    tetris.currentX--;
                    if (checkCollision()) tetris.currentX++;
                    break;
                case 'ArrowRight':
                    tetris.currentX++;
                    if (checkCollision()) tetris.currentX--;
                    break;
                case 'ArrowDown':
                    dropPiece();
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
            }
        }
        
        function updateTetrisDisplay() {
            document.getElementById('tetrisScore').textContent = tetris.score;
            document.getElementById('tetrisLines').textContent = tetris.lines;
            document.getElementById('tetrisLevel').textContent = tetris.level;
        }

        // Simon Says Game
        let simon = {};
        
        function initSimon() {
            simon = {
                sequence: [],
                playerSequence: [],
                level: 1,
                score: 0,
                isPlaying: false,
                isPlayerTurn: false
            };
            
            updateSimonDisplay();
            
            // Add event listeners to simon buttons
            const buttons = document.querySelectorAll('.simon-button');
            buttons.forEach((button, index) => {
                button.onclick = () => handleSimonClick(index);
            });
        }
        
        function startSimon() {
            simon.sequence = [];
            simon.playerSequence = [];
            simon.level = 1;
            simon.score = 0;
            simon.isPlaying = true;
            
            document.getElementById('simonStart').textContent = 'Playing...';
            document.getElementById('simonStart').disabled = true;
            document.getElementById('simonMessage').textContent = 'Watch the sequence!';
            
            updateSimonDisplay();
            nextLevel();
        }
        
        function nextLevel() {
            simon.playerSequence = [];
            simon.sequence.push(Math.floor(Math.random() * 4));
            simon.isPlayerTurn = false;
            
            document.getElementById('simonMessage').textContent = `Level ${simon.level} - Watch!`;
            
            setTimeout(() => {
                playSequence();
            }, 1000);
        }
        
        function playSequence() {
            let index = 0;
            
            const playNext = () => {
                if (index < simon.sequence.length) {
                    flashButton(simon.sequence[index]);
                    index++;
                    setTimeout(playNext, 800);
                } else {
                    simon.isPlayerTurn = true;
                    document.getElementById('simonMessage').textContent = 'Your turn!';
                }
            };
            
            playNext();
        }
        
        function flashButton(colorIndex) {
            const button = document.querySelector(`[data-color="${colorIndex}"]`);
            button.classList.add('active');
            
            setTimeout(() => {
                button.classList.remove('active');
            }, 400);
        }
        
        function handleSimonClick(colorIndex) {
            if (!simon.isPlayerTurn || !simon.isPlaying) return;
            
            flashButton(colorIndex);
            simon.playerSequence.push(colorIndex);
            
            // Check if the click matches the sequence
            const currentIndex = simon.playerSequence.length - 1;
            if (simon.playerSequence[currentIndex] !== simon.sequence[currentIndex]) {
                // Wrong! Game over
                gameOverSimon();
                return;
            }
            
            // Check if sequence is complete
            if (simon.playerSequence.length === simon.sequence.length) {
                simon.score += simon.level * 10;
                simon.level++;
                updateSimonDisplay();
                
                setTimeout(() => {
                    nextLevel();
                }, 1000);
            }
        }
        
        function gameOverSimon() {
            simon.isPlaying = false;
            simon.isPlayerTurn = false;
            
            document.getElementById('simonMessage').textContent = `Game Over! Final Score: ${simon.score}`;
            document.getElementById('simonStart').textContent = 'Start Game';
            document.getElementById('simonStart').disabled = false;
        }
        
        function updateSimonDisplay() {
            document.getElementById('simonLevel').textContent = simon.level;
            document.getElementById('simonScore').textContent = simon.score;
        }

        // Rock Paper Scissors Game
        let rps = {};
        
        function initRPS() {
            rps = {
                playerWins: 0,
                playerLosses: 0,
                playerTies: 0
            };
            
            updateRPSDisplay();
            document.getElementById('rpsResult').textContent = 'Choose your weapon!';
        }
        
        function playRPS(playerChoice) {
            const choices = ['rock', 'paper', 'scissors'];
            const computerChoice = choices[Math.floor(Math.random() * 3)];
            
            let result = '';
            if (playerChoice === computerChoice) {
                result = "It's a tie!";
                rps.playerTies++;
            } else if (
                (playerChoice === 'rock' && computerChoice === 'scissors') ||
                (playerChoice === 'paper' && computerChoice === 'rock') ||
                (playerChoice === 'scissors' && computerChoice === 'paper')
            ) {
                result = 'You win!';
                rps.playerWins++;
            } else {
                result = 'You lose!';
                rps.playerLosses++;
            }
            
            const emoji = {
                rock: '🪨',
                paper: '📄',
                scissors: '✂️'
            };
            
            document.getElementById('rpsResult').innerHTML = `
                <div style="margin-bottom: 15px;">
                    <div>You chose: ${emoji[playerChoice]}</div>
                    <div>Computer chose: ${emoji[computerChoice]}</div>
                </div>
                <div style="font-size: 1.4rem; font-weight: bold;">${result}</div>
            `;
            
            updateRPSDisplay();
        }
        
        function updateRPSDisplay() {
            document.getElementById('playerWins').textContent = rps.playerWins;
            document.getElementById('playerLosses').textContent = rps.playerLosses;
            document.getElementById('playerTies').textContent = rps.playerTies;
        }

        // Hangman Game
        let hangman = {};
        const HANGMAN_WORDS = [
            'JAVASCRIPT', 'COMPUTER', 'PROGRAMMING', 'WEBSITE', 'INTERNET', 'KEYBOARD',
            'MONITOR', 'ALGORITHM', 'DATABASE', 'SOFTWARE', 'HARDWARE', 'NETWORK',
            'BROWSER', 'GAMING', 'MOBILE', 'TABLET', 'LAPTOP', 'DESKTOP'
        ];
        
        const HANGMAN_STAGES = [
            '',
            '  +---+\n      |\n      |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========='
        ];
        
        function initHangman() {
            hangman = {
                currentWord: HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)],
                guessedLetters: [],
                wrongGuesses: 0,
                score: 0
            };
            
            createAlphabetGrid();
            updateHangmanDisplay();
        }
        
        function createAlphabetGrid() {
            const grid = document.getElementById('alphabetGrid');
            grid.innerHTML = '';
            
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                const button = document.createElement('button');
                button.className = 'letter-btn';
                button.textContent = letter;
                button.onclick = () => guessLetter(letter);
                grid.appendChild(button);
            }
        }
        
        function guessLetter(letter) {
            if (hangman.guessedLetters.includes(letter)) return;
            
            hangman.guessedLetters.push(letter);
            
            const button = Array.from(document.querySelectorAll('.letter-btn'))
                .find(btn => btn.textContent === letter);
            button.disabled = true;
            
            if (hangman.currentWord.includes(letter)) {
                button.style.background = '#00b894';
            } else {
                button.style.background = '#e17055';
                hangman.wrongGuesses++;
            }
            
            updateHangmanDisplay();
            checkHangmanGameEnd();
        }
        
        function updateHangmanDisplay() {
            // Update hangman drawing
            document.getElementById('hangmanDisplay').textContent = HANGMAN_STAGES[hangman.wrongGuesses];
            
            // Update word display
            const wordDisplay = hangman.currentWord.split('').map(letter => 
                hangman.guessedLetters.includes(letter) ? letter : '_'
            ).join(' ');
            document.getElementById('hangmanWord').textContent = wordDisplay;
            document.getElementById('hangmanScore').textContent = hangman.score;
            document.getElementById('hangmanWrongGuesses').textContent = hangman.wrongGuesses;
            document.getElementById('hangmanGuessedLetters').textContent = hangman.guessedLetters.join(', ');
        }
        function checkHangmanGameEnd() {
            if (hangman.wrongGuesses >= HANGMAN_STAGES.length - 1) {
                alert(`Game Over! The word was: ${hangman.currentWord}`);
                resetHangman();
            } else if (hangman.currentWord.split('').every(letter => hangman.guessedLetters.includes(letter))) {
                hangman.score += 10;
                alert(`Congratulations! You guessed the word: ${hangman.currentWord}`);
                resetHangman();
            }
        }
        function resetHangman() {
            hangman = {};
            initHangman();
        }
        // Initialize all games
        function initAllGames() {
            initSnake();
            initTicTacToe();
            initMemory();
            initPong();
            initTetris();
            initSimon();
            initRPS();
            initHangman();
        }
        // Call this function to initialize all games when the page loads
        window.onload = initAllGames;