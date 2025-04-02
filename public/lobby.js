// Connect to the server using Socket.io
const socket = io();

// DOM Elements
const roomCodeInput = document.getElementById('roomCode');
const joinRoomBtn = document.getElementById('joinRoom');
const createRoomBtn = document.getElementById('createRoom');
const playWithBotBtn = document.getElementById('playWithBot');
const messageDiv = document.getElementById('message');
const roomInfoDiv = document.getElementById('roomInfo');

// Utility Functions
function showMessage(text, type = 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

function showRoomInfo(code) {
    roomInfoDiv.textContent = `Room Code: ${code}`;
    roomInfoDiv.classList.add('show');
}

function hideRoomInfo() {
    roomInfoDiv.classList.remove('show');
}

// Socket Event Handlers
socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
});

socket.on('roomCreated', (roomCode) => {
    showRoomInfo(roomCode);
    showMessage('Room created successfully!', 'success');
});

socket.on('roomJoined', (roomCode) => {
    showMessage('Successfully joined room!', 'success');
    // Redirect to game page after a short delay
    setTimeout(() => {
        window.location.href = `/game?room=${roomCode}`;
    }, 1500);
});

socket.on('roomError', (error) => {
    showMessage(error);
});

socket.on('botGameStarted', () => {
    showMessage('Starting game with bot...', 'success');
    // Redirect to game page after a short delay
    setTimeout(() => {
        window.location.href = '/game?mode=bot';
    }, 1500);
});

// Event Listeners
joinRoomBtn.addEventListener('click', () => {
    const roomCode = roomCodeInput.value.trim();
    
    if (!roomCode) {
        showMessage('Please enter a room code');
        return;
    }
    
    socket.emit('joinRoom', roomCode);
});

createRoomBtn.addEventListener('click', () => {
    socket.emit('createRoom');
});

playWithBotBtn.addEventListener('click', () => {
    socket.emit('startBotGame');
});

// Handle Enter key in room code input
roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoomBtn.click();
    }
});
