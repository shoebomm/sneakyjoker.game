// Connect to the server using Socket.io
const socket = io();

// DOM Elements
const cards = document.querySelectorAll('.card');
const playCardBtn = document.querySelector('.play-card');
const bluffBtn = document.querySelector('.bluff');
const passBtn = document.querySelector('.pass');
const leaveGameBtn = document.querySelector('.leave-game');
const chatInput = document.querySelector('.chat-input input');
const sendBtn = document.querySelector('.send-btn');
const chatMessages = document.querySelector('.chat-messages');
const timer = document.querySelector('.timer');

// Game State
let selectedCard = null;
let timeLeft = 30;
let timerInterval;

// Card Selection
cards.forEach(card => {
    card.addEventListener('click', () => {
        if (selectedCard) {
            selectedCard.classList.remove('selected');
        }
        card.classList.add('selected');
        selectedCard = card;
    });
});

// Game Controls
playCardBtn.addEventListener('click', () => {
    if (!selectedCard) {
        showMessage('Please select a card first', 'error');
        return;
    }
    // Emit play card event
    socket.emit('playCard', {
        card: selectedCard.dataset.value
    });
    selectedCard.classList.remove('selected');
    selectedCard = null;
});

bluffBtn.addEventListener('click', () => {
    if (!selectedCard) {
        showMessage('Please select a card first', 'error');
        return;
    }
    // Emit bluff event
    socket.emit('bluff', {
        card: selectedCard.dataset.value
    });
    selectedCard.classList.remove('selected');
    selectedCard = null;
});

passBtn.addEventListener('click', () => {
    // Emit pass event
    socket.emit('pass');
});

leaveGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to leave the game?')) {
        window.location.href = '/lobby';
    }
});

// Chat Functionality
function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        addMessage(message, 'user');
        chatInput.value = '';
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Timer Functionality
function startTimer() {
    timeLeft = 30;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Handle time up
            socket.emit('timeUp');
        }
    }, 1000);
}

function updateTimerDisplay() {
    timer.textContent = timeLeft;
}

// Message Display
function addMessage(text, type = 'system') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showMessage(text, type = 'system') {
    addMessage(text, type);
}

// Socket Event Handlers
socket.on('connect', () => {
    console.log('Connected to game server:', socket.id);
    showMessage('Connected to game server', 'system');
});

socket.on('turnStart', (playerId) => {
    startTimer();
    // Update active player indicator
    document.querySelectorAll('.player').forEach(player => {
        player.classList.remove('active');
    });
    const activePlayer = document.querySelector(`.player-${playerId}`);
    if (activePlayer) {
        activePlayer.classList.add('active');
    }
});

socket.on('chatMessage', (data) => {
    addMessage(`${data.username}: ${data.message}`, 'user');
});

socket.on('gameError', (error) => {
    showMessage(error, 'error');
});

// Initialize game state
startTimer(); 