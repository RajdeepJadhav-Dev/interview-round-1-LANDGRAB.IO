import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socketService';

const CELL_SIZE = 12; // pixels
const GRID_SIZE = 50;

export const GameBoard = () => {
  const canvasRef = useRef(null);
  const { grid, currentUser } = useGameStore();
  const [hoveredCell, setHoveredCell] = useState(null);

  // Draw grid on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    grid.forEach((cell) => {
      const x = cell.x * CELL_SIZE;
      const y = cell.y * CELL_SIZE;

      // Fill color
      if (cell.color) {
        ctx.fillStyle = cell.color;
      } else {
        ctx.fillStyle = '#E5E7EB'; // Gray for unclaimed
      }
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

      // Border
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Highlight if owned by current user
      if (cell.ownerId === currentUser?.id) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    });

    // Highlight hovered cell
    if (hoveredCell) {
      const x = hoveredCell.x * CELL_SIZE;
      const y = hoveredCell.y * CELL_SIZE;
      ctx.strokeStyle = currentUser?.color || '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    }
  }, [grid, hoveredCell, currentUser]);

  // Handle click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      socketService.claimCell(x, y);
    }
  };

  // Handle hover
  const handleCanvasMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setHoveredCell({ x, y });
    } else {
      setHoveredCell(null);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setHoveredCell(null)}
        style={{
          border: '2px solid #1F2937',
          cursor: 'crosshair',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
};