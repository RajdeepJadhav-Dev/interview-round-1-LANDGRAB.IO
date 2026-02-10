const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameStateManager = require('./services/GameStateManager');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const gameManager = new GameStateManager();

const COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

let colorIndex = 0;

// ✅ ROUND MANAGEMENT - MANUAL START
const ROUND_DURATION = 10 * 60 * 1000; // 10 minutes
const BREAK_DURATION = 10 * 1000; // 10 seconds between rounds

let roundState = {
  roundNumber: 0,
  startTime: null,
  endTime: null,
  isActive: false,
  isWaiting: true, // ✅ Waiting for players to start
  winner: null,
};

let roundEndTimer = null;

function startNewRound() {
  console.log(`🎮 Starting Round ${roundState.roundNumber + 1}...`);
  
  // Clear any existing timer
  if (roundEndTimer) {
    clearTimeout(roundEndTimer);
  }
  
  roundState = {
    roundNumber: roundState.roundNumber + 1,
    startTime: Date.now(),
    endTime: Date.now() + ROUND_DURATION,
    isActive: true,
    isWaiting: false,
    winner: null,
  };
  
  // Reset game state
  gameManager.reset();
  
  // Broadcast round start to all clients
  io.emit('round-started', {
    roundNumber: roundState.roundNumber,
    startTime: roundState.startTime,
    endTime: roundState.endTime,
    duration: ROUND_DURATION,
  });
  
  // Send fresh game state
  io.emit('game-state-reset', {
    grid: gameManager.getGridState(),
  });
  
  // Schedule round end
  scheduleRoundEnd();
}

function endRound(reason = 'time', earlyWinner = null) {
  if (!roundState.isActive) return;
  
  console.log(`⏱️ Round ${roundState.roundNumber} ended: ${reason}`);
  
  roundState.isActive = false;
  roundState.isWaiting = true; // ✅ Back to waiting state
  
  const winner = earlyWinner || gameManager.getRoundWinner();
  roundState.winner = winner;
  
  // Clear timer
  if (roundEndTimer) {
    clearTimeout(roundEndTimer);
    roundEndTimer = null;
  }
  
  // Announce round end
  io.emit('round-ended', {
    roundNumber: roundState.roundNumber,
    reason: reason,
    winner: winner,
    leaderboard: gameManager.getLeaderboard(),
    message: winner 
      ? `🏆 Round ${roundState.roundNumber} Winner: ${winner.name} with ${winner.score} tiles!`
      : '⏱️ Time\'s up!',
  });
}

function scheduleRoundEnd() {
  const timeRemaining = roundState.endTime - Date.now();
  
  if (timeRemaining > 0) {
    roundEndTimer = setTimeout(() => {
      endRound('time');
    }, timeRemaining);
  }
}

// ✅ TIME UPDATES (every 5 seconds during active round)
setInterval(() => {
  if (roundState.isActive) {
    io.emit('round-tick', {
      currentTime: Date.now(),
      endTime: roundState.endTime,
      timeRemaining: Math.max(0, roundState.endTime - Date.now()),
    });
  }
}, 5000);

// ✅ CONNECTION HANDLING
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const userColor = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  
  const userName = `Player${Math.floor(Math.random() * 1000)}`;
  const user = gameManager.addUser(socket.id, userName, userColor);

  // Send initial state
  socket.emit('initial-state', {
    grid: gameManager.getGridState(),
    users: gameManager.getUsersState(),
    currentUser: user,
  });
  
  // ✅ Send round info
  socket.emit('round-info', {
    roundNumber: roundState.roundNumber,
    startTime: roundState.startTime,
    endTime: roundState.endTime,
    isActive: roundState.isActive,
    isWaiting: roundState.isWaiting,
  });

  socket.broadcast.emit('user-joined', user);

  // ✅ HANDLE MANUAL ROUND START
  socket.on('start-round', () => {
    // Only start if waiting
    if (roundState.isWaiting && !roundState.isActive) {
      console.log(`👤 ${user.name} started a new round`);
      startNewRound();
    } else {
      socket.emit('start-round-error', { 
        error: 'Round already active' 
      });
    }
  });

  // ✅ HANDLE CELL CLAIM
  socket.on('claim-cell', (data) => {
    // Don't allow claims if round is not active
    if (!roundState.isActive) {
      socket.emit('claim-error', { error: 'Round not active. Start a round first!' });
      return;
    }
    
    const result = gameManager.claimCell(socket.id, data.x, data.y);

    if (result.success && result.cell) {
      io.emit('cell-claimed', {
        x: result.cell.x,
        y: result.cell.y,
        ownerId: result.cell.ownerId,
        color: result.cell.color,
        capturedAt: result.cell.capturedAt,
      });

      io.emit('leaderboard-update', gameManager.getLeaderboard());
      
      // ✅ CHECK FOR EARLY VICTORY
      const victory = gameManager.checkVictoryCondition();
      if (victory) {
        endRound('victory', victory.winner);
      }
    } else {
      socket.emit('claim-error', { error: result.error });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameManager.removeUser(socket.id);
    io.emit('user-left', { userId: socket.id });
    io.emit('leaderboard-update', gameManager.getLeaderboard());
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⏰ Round duration: ${ROUND_DURATION / 60000} minutes`);
  console.log(`🏆 Victory threshold: ${gameManager.VICTORY_THRESHOLD} tiles`);
  console.log(`🎮 Waiting for players to start first round...`);
});