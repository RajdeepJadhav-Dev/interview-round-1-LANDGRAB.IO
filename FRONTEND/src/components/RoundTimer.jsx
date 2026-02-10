import { useState, useEffect } from 'react';

export const RoundTimer = ({ endTime, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
      
      // Last minute = urgent
      setUrgent(remaining < 60000 && remaining > 0);
    }, 100);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!isActive) {
    return (
      <div style={{
        backgroundColor: '#374151',
        color: '#9CA3AF',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
      }}>
        ⏸️ Between Rounds
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isOver = timeLeft === 0;

  return (
    <div style={{
      backgroundColor: urgent ? '#DC2626' : isOver ? '#374151' : '#1F2937',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '18px',
      animation: urgent ? 'pulse 1s infinite' : 'none',
      border: urgent ? '2px solid #FCA5A5' : 'none',
    }}>
      {isOver ? (
        '⏱️ Round Ending...'
      ) : (
        <>
          ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
          {urgent && ' ⚠️'}
        </>
      )}
    </div>
  );
};