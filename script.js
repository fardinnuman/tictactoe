const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const playerXNameInput = document.getElementById('playerXName');
const playerONameInput = document.getElementById('playerOName');
const startGameButton = document.getElementById('startGame');
const playerXDisplay = document.getElementById('playerXDisplay');
const playerODisplay = document.getElementById('playerODisplay');
const playerXAvatar = document.getElementById('playerXAvatar');
const playerOAvatar = document.getElementById('playerOAvatar');
const cells = document.querySelectorAll('.cell');
const playerXElement = document.getElementById('playerX');
const playerOElement = document.getElementById('playerO');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const resetButton = document.getElementById('reset');
const backToMenuButton = document.getElementById('backToMenu');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalButton = document.getElementById('modalButton');
const themeToggle = document.getElementById('themeToggle');
const timerElement = document.getElementById('timer');
const moveHistoryElement = document.getElementById('moveHistory');
const aiThinkingElement = document.getElementById('aiThinking');
const gameModeButtons = document.querySelectorAll('.game-mode-btn');
const playerOInputGroup = document.getElementById('playerOInputGroup');
const oAvatarSelection = document.getElementById('oAvatarSelection');
const xAvatarOptions = document.querySelectorAll('#xAvatarSelection .avatar-option');
const oAvatarOptions = document.querySelectorAll('#oAvatarSelection .avatar-option');
const xNameError = document.getElementById('xNameError');
const oNameError = document.getElementById('oNameError');


const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');
const backgroundMusic = document.getElementById('backgroundMusic');


let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };
let playerNames = { X: "Player X", O: "Player O" };
let playerAvatars = { X: "x.png", O: "o.png" };
let gameMode = "pvp";
let gameStartTime;
let timerInterval;
let moveHistory = [];


const AI_AVATAR_URL = "AI.png";
const AI_NAME = "Hashu Apa";


const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];


function checkFormValidity() {
    const xNameValid = playerXNameInput.value.trim().length > 0;
    const oNameValid = gameMode === "pvp" ? playerONameInput.value.trim().length > 0 : true;
    const xAvatarSelected = document.querySelector('#xAvatarSelection .avatar-option.selected') !== null;
    const oAvatarSelected = gameMode === "pvp" ?
        document.querySelector('#oAvatarSelection .avatar-option.selected') !== null : true;

    xNameError.style.display = xNameValid ? 'none' : 'block';
    oNameError.style.display = (gameMode === "pvp" && !oNameValid) ? 'block' : 'none';

    startGameButton.disabled = !(xNameValid && (gameMode === "ai" || oNameValid) &&
        xAvatarSelected && (gameMode === "ai" || oAvatarSelected));
}


function initGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    moveHistory = [];
    updateMoveHistory();
    updatePlayerDisplay();

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o", "winner");
    });

    modal.classList.remove("show");


    gameStartTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    if (gameMode === "ai" && currentPlayer === "O") {
        makeAIMove();
    }
}


function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}


function updateMoveHistory() {
    moveHistoryElement.innerHTML = moveHistory.map((move, index) =>
        `<p>${index + 1}. ${move.player} placed ${move.symbol} at ${move.position}</p>`
    ).join('');
    moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
}

function startGame() {

    if (playerXNameInput.value.trim().length === 0 ||
        (gameMode === "pvp" && playerONameInput.value.trim().length === 0)) {
        return;
    }

    playerNames.X = playerXNameInput.value.trim() || "Player X";
    playerNames.O = gameMode === "ai" ? AI_NAME : (playerONameInput.value.trim() || "Player O");

    playerXDisplay.textContent = playerNames.X;
    playerODisplay.textContent = playerNames.O;


    const selectedXAvatar = document.querySelector('#xAvatarSelection .avatar-option.selected img');
    const selectedOAvatar = gameMode === "ai" ?
        { src: AI_AVATAR_URL } :
        document.querySelector('#oAvatarSelection .avatar-option.selected img');

    playerAvatars.X = selectedXAvatar ? selectedXAvatar.src : "x.png";
    playerAvatars.O = selectedOAvatar ? selectedOAvatar.src : "o.png";

    playerXAvatar.src = playerAvatars.X;
    playerOAvatar.src = playerAvatars.O;

    setupScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");


    backgroundMusic.volume = 0.3;
    backgroundMusic.play().catch(e => console.log("Autoplay prevented:", e));

    initGame();
}


function makeAIMove() {
    if (!gameActive || currentPlayer !== "O" || gameMode !== "ai") return;

    aiThinkingElement.classList.add("show");

    setTimeout(() => {
        const move = getBestMove();

        if (move !== null) {
            const cell = document.querySelector(`.cell[data-index="${move}"]`);
            handleCellPlayed(cell, move);
            handleResultValidation();
        }

        aiThinkingElement.classList.remove("show");
    }, Math.random() * 1000 + 300);
}


function getBestMove() {

    function minimax(board, depth, isMaximizing) {
        const winner = checkWinner(board);
        if (winner === "O") return 10 - depth;
        if (winner === "X") return depth - 10;
        if (!board.includes("")) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    const score = minimax(board, depth + 1, false);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    const score = minimax(board, depth + 1, true);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            gameState[i] = "O";
            const score = minimax(gameState, 0, false);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function checkWinner(board) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function handleCellClick(clickedCellEvent) {
    if ((gameMode === "ai" && currentPlayer === "O") || !gameActive) return;

    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "") {
        return;
    }

    clickSound.currentTime = 0;
    clickSound.play();

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();


    if (gameActive && gameMode === "ai" && currentPlayer === "O") {
        makeAIMove();
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());

    const row = Math.floor(clickedCellIndex / 3) + 1;
    const col = (clickedCellIndex % 3) + 1;
    moveHistory.push({
        player: currentPlayer === "X" ? playerNames.X : playerNames.O,
        symbol: currentPlayer,
        index: clickedCellIndex,
        position: `(${row},${col})`
    });
    updateMoveHistory();
}

function handleResultValidation() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        const a = gameState[winCondition[0]];
        const b = gameState[winCondition[1]];
        const c = gameState[winCondition[2]];

        if (a === "" || b === "" || c === "") {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            highlightWinningCells(winCondition);
            break;
        }
    }

    if (roundWon) {
        scores[currentPlayer]++;
        updateScores();
        const winnerName = currentPlayer === "X" ? playerNames.X : playerNames.O;
        showResultModal(`${winnerName} wins!`);
        createConfetti();
        winSound.play();
        gameActive = false;
        clearInterval(timerInterval);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        showResultModal("It's a draw!");
        drawSound.play();
        gameActive = false;
        clearInterval(timerInterval);
        return;
    }

    changePlayer();
}

function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        cells[index].classList.add("winner");
    });
}


function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updatePlayerDisplay();
}


function updatePlayerDisplay() {
    if (currentPlayer === "X") {
        playerXElement.classList.add("active");
        playerOElement.classList.remove("active");
    } else {
        playerOElement.classList.add("active");
        playerXElement.classList.remove("active");
    }
}


function updateScores() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}


function showResultModal(message) {
    modalTitle.textContent = message.includes("wins") ? "Victory!" : "Game Over!";
    modalMessage.textContent = message;
    modal.classList.add("show");
}


function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🥳', '👑', '🏆'];

    for (let i = 0; i < 200; i++) {

        const delay = Math.random() * 2000;

        setTimeout(() => {

            if (Math.random() > 0.7) {
                const emoji = document.createElement('div');
                emoji.className = 'emoji-confetti';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];


                emoji.style.left = Math.random() * 100 + 'vw';


                const size = Math.random() * 20 + 10;
                emoji.style.fontSize = size + 'px';


                emoji.style.animationDuration = Math.random() * 3 + 2 + 's';


                emoji.style.setProperty('--tx', (Math.random() > 0.5 ? '' : '-') + (Math.random() * 100 + 50) + 'px');

                document.body.appendChild(emoji);


                setTimeout(() => {
                    emoji.remove();
                }, 5000);
            } else {

                const confetti = document.createElement('div');
                confetti.className = 'confetti';


                confetti.style.left = Math.random() * 100 + 'vw';


                const size = Math.random() * 15 + 5;
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';


                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];


                if (Math.random() > 0.5) {
                    confetti.style.borderRadius = '0';
                }


                confetti.style.animationDuration = Math.random() * 3 + 2 + 's';


                confetti.style.setProperty('--tx', (Math.random() > 0.5 ? '' : '-') + (Math.random() * 100 + 50) + 'px');

                document.body.appendChild(confetti);


                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }
        }, delay);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '🌞' : '🌓';
    localStorage.setItem('darkMode', isDark);
}

function handleGameModeChange(mode) {
    gameMode = mode;

    if (mode === "ai") {
        playerOInputGroup.style.display = "none";
        oAvatarSelection.style.display = "none";
    } else {
        playerOInputGroup.style.display = "block";
        oAvatarSelection.style.display = "flex";
    }

    checkFormValidity();
}

startGameButton.addEventListener('click', startGame);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', initGame);
modalButton.addEventListener('click', initGame);
backToMenuButton.addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    clearInterval(timerInterval);
    backgroundMusic.pause();
});
themeToggle.addEventListener('click', toggleDarkMode);

playerXNameInput.addEventListener('input', checkFormValidity);
playerONameInput.addEventListener('input', checkFormValidity);

playerONameInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !startGameButton.disabled) {
        startGame();
    }
});

gameModeButtons.forEach(button => {
    button.addEventListener('click', () => {
        gameModeButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        handleGameModeChange(button.dataset.mode);
    });
});

xAvatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        xAvatarOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        playerAvatars.X = option.querySelector('img').src;
        checkFormValidity();
    });
});

oAvatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        oAvatarOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        playerAvatars.O = option.querySelector('img').src;
        checkFormValidity();
    });
});

if (localStorage.getItem('darkMode') === 'true') {
    toggleDarkMode();
}

checkFormValidity();