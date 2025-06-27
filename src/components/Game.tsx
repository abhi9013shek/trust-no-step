
import React, { useState, useEffect, useCallback } from 'react';
import Player from './Player';
import Level from './Level';
import GameUI from './GameUI';
import DeathScreen from './DeathScreen';
import { useToast } from '@/hooks/use-toast';

export interface Position {
  x: number;
  y: number;
}

export interface Trap {
  id: string;
  type: 'disappearing' | 'fake' | 'spike' | 'reverse';
  x: number;
  y: number;
  width: number;
  height: number;
  triggered?: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  platforms: Position[];
  traps: Trap[];
  exit: Position;
  spawn: Position;
}

const SAMPLE_LEVELS: LevelData[] = [
  {
    id: 1,
    name: "LEVEL 1: Baby Steps",
    platforms: [
      { x: 0, y: 500 }, { x: 100, y: 500 }, { x: 200, y: 500 }, { x: 300, y: 500 },
      { x: 500, y: 400 }, { x: 700, y: 300 }
    ],
    traps: [
      { id: 't1', type: 'disappearing', x: 400, y: 500, width: 100, height: 20 }
    ],
    exit: { x: 750, y: 280 },
    spawn: { x: 50, y: 450 }
  },
  {
    id: 2,
    name: "LEVEL 2: Trust Issues Begin",
    platforms: [
      { x: 0, y: 500 }, { x: 150, y: 450 }, { x: 350, y: 400 },
      { x: 550, y: 350 }, { x: 750, y: 300 }
    ],
    traps: [
      { id: 't1', type: 'fake', x: 250, y: 425, width: 100, height: 20 },
      { id: 't2', type: 'spike', x: 600, y: 330, width: 50, height: 20 }
    ],
    exit: { x: 800, y: 280 },
    spawn: { x: 50, y: 450 }
  },
  {
    id: 3,
    name: "LEVEL 3: Deception Mastery",
    platforms: [
      { x: 0, y: 500 }, { x: 200, y: 450 }, { x: 450, y: 400 },
      { x: 650, y: 350 }, { x: 300, y: 300 }
    ],
    traps: [
      { id: 't1', type: 'disappearing', x: 100, y: 500, width: 100, height: 20 },
      { id: 't2', type: 'fake', x: 350, y: 425, width: 100, height: 20 },
      { id: 't3', type: 'reverse', x: 500, y: 380, width: 100, height: 20 }
    ],
    exit: { x: 350, y: 280 },
    spawn: { x: 50, y: 450 }
  }
];

const DEATH_MESSAGES = [
  "Should've jumped with your eyes closed!",
  "Trust no platform, not even yourself.",
  "That wasn't supposed to be solid...",
  "Welcome to trust issues simulator!",
  "Plot twist: Everything is a lie.",
  "Did you really think that would work?",
  "The cake is a lie, and so is that platform.",
  "Paranoia level: Insufficient."
];

const Game = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerPos, setPlayerPos] = useState<Position>(SAMPLE_LEVELS[0].spawn);
  const [gameState, setGameState] = useState<'playing' | 'dead' | 'levelComplete'>('playing');
  const [deathMessage, setDeathMessage] = useState('');
  const [reversedControls, setReversedControls] = useState(false);
  const [triggeredTraps, setTriggeredTraps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const currentLevelData = SAMPLE_LEVELS[currentLevel];

  const resetLevel = useCallback(() => {
    setPlayerPos(currentLevelData.spawn);
    setTriggeredTraps(new Set());
    setReversedControls(false);
    setGameState('playing');
  }, [currentLevelData]);

  const handlePlayerDeath = useCallback(() => {
    if (lives > 1) {
      setLives(prev => prev - 1);
      const randomMessage = DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
      setDeathMessage(randomMessage);
      setGameState('dead');
      
      // Add screen shake effect
      document.body.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    } else {
      setGameState('dead');
      setDeathMessage("Game Over! Your trust issues are now complete.");
      setLives(0);
    }
  }, [lives]);

  const handleTrapTrigger = useCallback((trap: Trap) => {
    if (triggeredTraps.has(trap.id)) return;

    setTriggeredTraps(prev => new Set([...prev, trap.id]));

    switch (trap.type) {
      case 'reverse':
        setReversedControls(true);
        toast({
          title: "Controls Reversed!",
          description: "Left is right, right is left!",
          variant: "destructive"
        });
        setTimeout(() => setReversedControls(false), 5000);
        break;
      case 'spike':
        handlePlayerDeath();
        break;
    }
  }, [triggeredTraps, handlePlayerDeath, toast]);

  const handleLevelComplete = useCallback(() => {
    if (currentLevel < SAMPLE_LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setGameState('levelComplete');
      toast({
        title: "Level Complete!",
        description: `Moving to ${SAMPLE_LEVELS[currentLevel + 1].name}`,
        variant: "default"
      });
      
      setTimeout(() => {
        setPlayerPos(SAMPLE_LEVELS[currentLevel + 1].spawn);
        setTriggeredTraps(new Set());
        setReversedControls(false);
        setGameState('playing');
      }, 2000);
    } else {
      toast({
        title: "Game Complete!",
        description: "You've mastered the art of mistrust!",
        variant: "default"
      });
    }
  }, [currentLevel, toast]);

  const handleRestart = () => {
    if (lives > 0) {
      resetLevel();
    } else {
      // Full game restart
      setCurrentLevel(0);
      setLives(3);
      setPlayerPos(SAMPLE_LEVELS[0].spawn);
      setTriggeredTraps(new Set());
      setReversedControls(false);
      setGameState('playing');
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRestart]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Game UI */}
      <GameUI 
        lives={lives}
        level={currentLevel + 1}
        levelName={currentLevelData.name}
        reversedControls={reversedControls}
      />

      {/* Game World */}
      <div className="relative w-full h-full">
        <Level 
          levelData={currentLevelData}
          triggeredTraps={triggeredTraps}
          onTrapTrigger={handleTrapTrigger}
        />
        
        {gameState === 'playing' && (
          <Player
            position={playerPos}
            onPositionChange={setPlayerPos}
            onDeath={handlePlayerDeath}
            onLevelComplete={handleLevelComplete}
            levelData={currentLevelData}
            reversedControls={reversedControls}
            triggeredTraps={triggeredTraps}
          />
        )}
      </div>

      {/* Death Screen */}
      {gameState === 'dead' && (
        <DeathScreen
          message={deathMessage}
          onRestart={handleRestart}
          lives={lives}
        />
      )}

      {/* Level Complete Screen */}
      {gameState === 'levelComplete' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4 text-green-400">Level Complete!</h2>
            <p className="text-xl">Preparing next challenge...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white text-sm opacity-75">
        <p>Arrow Keys / WASD to move • Spacebar to jump • R to restart</p>
        <p className="text-xs mt-1">Trust nothing. Question everything.</p>
      </div>
    </div>
  );
};

export default Game;
