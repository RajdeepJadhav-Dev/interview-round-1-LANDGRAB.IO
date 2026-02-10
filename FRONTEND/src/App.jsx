import { useEffect, useState, useMemo } from 'react';
import { GameBoard } from './components/GameBoard';
import { Leaderboard } from './components/Leaderboard';
import { RoundTimer } from './components/RoundTimer';
import { LandingPage } from './components/LandingPage';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socketService';

function App() {
  const { currentUser, connected, grid } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [roundInfo, setRoundInfo] = useState({
    endTime: Date.now() + 600000,
    isActive: true,
    isWaiting: true, // Add isWaiting state
    roundNumber: 1,
  });

  const currentScore = useMemo(() => {
    if (!currentUser) return 0;
    return grid.filter((cell) => cell.ownerId === currentUser.id).length;
  }, [grid, currentUser]);

  useEffect(() => {
    socketService.connect();
    
    // ✅ Listen for round events
    socketService.socket.on('round-info', (data) => {
      setRoundInfo({
        endTime: data.endTime,
        isActive: data.isActive,
        isWaiting: data.isWaiting, // Capture waiting state
        roundNumber: data.roundNumber,
      });
    });
    
    socketService.socket.on('round-started', (data) => {
      setRoundInfo({
        endTime: data.endTime,
        isActive: true,
        isWaiting: false,
        roundNumber: data.roundNumber,
      });
    });
    
    socketService.socket.on('round-ended', (data) => {
      setRoundInfo(prev => ({
        ...prev,
        isActive: false,
        isWaiting: true, // Round ended, now waiting
      }));
      
      // Show winner announcement
      if (data.winner) {
        alert(data.message);
      }
    });
    
    socketService.socket.on('round-tick', (data) => {
      setRoundInfo(prev => ({
        ...prev,
        endTime: data.endTime,
      }));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
    // Emit start-round if we are waiting/inactive
    if (!roundInfo.isActive) {
        socketService.socket.emit('start-round');
    }
  };

  if (!gameStarted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #111827, #1F2937)', // Consistent background
      }}>
        <LandingPage 
          onStartGame={handleStartGame} 
          roundInfo={roundInfo}
        />
      </div>
    );
  }

  if (!connected || !currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'white', fontSize: '24px' }}>
          Connecting...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container px-4 h-16 flex items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <span className="text-2xl">🏰</span>
               <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
                LANDGRAB.IO
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <span className="text-indigo-400">Run</span>
                <span className="text-slate-200">#{roundInfo.roundNumber}</span>
              </div>
              <RoundTimer endTime={roundInfo.endTime} isActive={roundInfo.isActive} />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div
                className="w-8 h-8 rounded-lg shadow-lg ring-2 ring-white/10"
                style={{ backgroundColor: currentUser.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white leading-none">
                  {currentUser.name}
                </span>
                <span className="text-xs text-slate-500 mt-1">Player</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Score</span>
               <span className="text-2xl font-bold text-white tabular-nums leading-none">
                 {currentScore}
               </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Game Board Section */}
        <section className="flex-1 w-full lg:max-w-4xl">
           <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-slate-900/50 backdrop-blur-sm">
             {/* Decorative glow */}
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             
             <div className="relative p-1">
               <GameBoard />
             </div>
           </div>
           
           {/* Mobile-only Round Info (visible only on small screens) */}
           <div className="mt-6 md:hidden flex justify-between items-center p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="text-sm text-slate-400">Round #{roundInfo.roundNumber}</div>
              <RoundTimer endTime={roundInfo.endTime} isActive={roundInfo.isActive} />
           </div>
        </section>

        {/* Sidebar / Leaderboard */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="rounded-xl border border-white/5 bg-slate-900/80 shadow-xl overflow-hidden">
             <div className="p-4 border-b border-white/5 bg-white/[0.02]">
               <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                 🏆 Leaderboard
               </h2>
             </div>
             <div className="p-2">
               <Leaderboard />
             </div>
          </div>
          
          <div className="rounded-xl border border-white/5 bg-indigo-950/20 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Game Tip
            </h3>
            <p className="text-sm text-indigo-200/70">
              Capture tiles to increase your score. Watch out for opponents trying to steal your land!
            </p>
          </div>
        </aside>
      </main>
      
      {/* Round Over Overlay */}
      {!roundInfo.isActive && !roundInfo.isWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-slate-900 shadow-xl">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Round Over!
              </h2>
              <p className="text-slate-400">
                The current round has ended. Get ready for the next battle!
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-400 bg-indigo-500/10 py-2 px-4 rounded-full w-fit mx-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Next round starting soon...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;