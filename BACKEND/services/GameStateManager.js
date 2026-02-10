class GameStateManager {
  constructor() {
    this.grid = new Map();
    this.users = new Map();
    this.GRID_SIZE = 50;
    this.CELL_COOLDOWN = 5000;
    this.VICTORY_THRESHOLD = 1000; // 40% of 2,500 tiles
    
    this.initializeGrid();
  }

  initializeGrid() {
    // Create empty grid
    for (let x = 0; x < this.GRID_SIZE; x++) {
      for (let y = 0; y < this.GRID_SIZE; y++) {
        const key = `${x}-${y}`;
        this.grid.set(key, {
          x,
          y,
          ownerId: null,
          capturedAt: 0,
          color: null,
        });
      }
    }
  }

  addUser(id, name, color) {
    const user = {
      id,
      name,
      color,
      score: 0,
      online: true,
    };
    this.users.set(id, user);
    return user;
  }

  removeUser(id) {
    const user = this.users.get(id);
    if (user) {
      user.online = false;
    }
  }

  claimCell(userId, x, y) {
    // Validation
    if (!this.isValidCoordinate(x, y)) {
      return { success: false, error: 'Invalid coordinates' };
    }

    const key = `${x}-${y}`;
    const cell = this.grid.get(key);
    const now = Date.now();

    // Check cooldown
    if (cell.ownerId && now - cell.capturedAt < this.CELL_COOLDOWN) {
      return { success: false, error: 'Cell on cooldown' };
    }

    // Check if already owned by this user
    if (cell.ownerId === userId) {
      return { success: false, error: 'Already your cell' };
    }

    // Get user color
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Update scores
    if (cell.ownerId) {
      // Decrease previous owner's score
      const prevOwner = this.users.get(cell.ownerId);
      if (prevOwner) {
        prevOwner.score = Math.max(0, prevOwner.score - 1);
      }
    }
    
    // Increase new owner's score
    user.score += 1;

    // Claim cell
    cell.ownerId = userId;
    cell.capturedAt = now;
    cell.color = user.color;

    return { success: true, cell };
  }

  isValidCoordinate(x, y) {
    return (
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      x < this.GRID_SIZE &&
      y >= 0 &&
      y < this.GRID_SIZE
    );
  }

  getGridState() {
    const now = Date.now();
    return Array.from(this.grid.values()).map(cell => ({
      ...cell,
      locked: cell.ownerId && (now - cell.capturedAt < this.CELL_COOLDOWN),
      cooldownRemaining: cell.ownerId 
        ? Math.max(0, this.CELL_COOLDOWN - (now - cell.capturedAt))
        : 0
    }));
  }

  getUsersState() {
    return Array.from(this.users.values());
  }

  getLeaderboard() {
    return Array.from(this.users.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  reset() {
    console.log('🔄 Resetting game state...');
    
    // Clear grid
    this.grid.clear();
    this.initializeGrid();
    
    // Reset user scores but keep users connected
    this.users.forEach(user => {
      user.score = 0;
    });
  }

  checkVictoryCondition() {
    const leaderboard = this.getLeaderboard();
    if (leaderboard.length === 0) return null;
    
    const leader = leaderboard[0];
    
    // Check if leader reached victory threshold
    if (leader.score >= this.VICTORY_THRESHOLD) {
      return {
        type: 'score',
        winner: leader,
        message: `🎉 ${leader.name} wins with ${leader.score} tiles!`,
      };
    }
    
    return null;
  }

  getRoundWinner() {
    const leaderboard = this.getLeaderboard();
    return leaderboard[0] || null;
  }
}

module.exports = GameStateManager;