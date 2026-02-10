import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // State
  grid: [],
  users: [],
  currentUser: null,
  leaderboard: [],
  connected: false,

  // Actions
  setInitialState: (grid, users, currentUser) => {
    set({ grid, users, currentUser, connected: true });
  },

  updateCell: (updatedCell) => {
    set((state) => ({
      grid: state.grid.map((cell) =>
        cell.x === updatedCell.x && cell.y === updatedCell.y
          ? updatedCell
          : cell
      ),
    }));
  },

  addUser: (user) => {
    set((state) => ({
      users: [...state.users, user],
    }));
  },

  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));
  },

  updateLeaderboard: (leaderboard) => {
    set((state) => {
      // Find current user in the updated leaderboard
      const updatedCurrentUser = leaderboard.find(
        (user) => user.id === state.currentUser?.id
      );

      // If current user is in leaderboard, update their data
      if (updatedCurrentUser) {
        return {
          leaderboard,
          currentUser: updatedCurrentUser, // ✅ Update currentUser with new score!
        };
      }

      // If current user is not in top 10, find them in users array
      const currentUserFromUsers = state.users.find(
        (user) => user.id === state.currentUser?.id
      );

      return {
        leaderboard,
        currentUser: currentUserFromUsers || state.currentUser,
      };
    });
  },

  setConnected: (connected) => {
    set({ connected });
  },

  getCellByCoordinates: (x, y) => {
    return get().grid.find((cell) => cell.x === x && cell.y === y);
  },
}));