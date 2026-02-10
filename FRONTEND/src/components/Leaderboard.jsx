import { useGameStore } from '../store/gameStore';

export const Leaderboard = () => {
  const { leaderboard, currentUser } = useGameStore();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      width: '250px',
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1F2937' }}>
        🏆 Leaderboard
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leaderboard.map((user, index) => {
          const isCurrentUser = user.id === currentUser?.id;
          return (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: isCurrentUser ? '#FEF3C7' : '#F9FAFB',
                border: isCurrentUser ? '2px solid #FBBF24' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#6B7280' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: user.color,
                  }}
                />
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  {user.name} {isCurrentUser && '(You)'}
                </span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#374151' }}>
                {user.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};