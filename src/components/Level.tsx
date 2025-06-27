
import React, { useEffect, useState } from 'react';
import { LevelData, Trap } from './Game';

interface LevelProps {
  levelData: LevelData;
  triggeredTraps: Set<string>;
  onTrapTrigger: (trap: Trap) => void;
}

const Level: React.FC<LevelProps> = ({ levelData, triggeredTraps, onTrapTrigger }) => {
  const [disappearingTraps, setDisappearingTraps] = useState<Set<string>>(new Set());

  // Handle disappearing platform logic
  useEffect(() => {
    levelData.traps.forEach(trap => {
      if (trap.type === 'disappearing' && triggeredTraps.has(trap.id) && !disappearingTraps.has(trap.id)) {
        setTimeout(() => {
          setDisappearingTraps(prev => new Set([...prev, trap.id]));
          onTrapTrigger(trap);
        }, 300); // 0.3s delay before disappearing
      }
    });
  }, [triggeredTraps, levelData.traps, onTrapTrigger, disappearingTraps]);

  const renderPlatform = (platform: { x: number; y: number }, index: number) => (
    <div
      key={`platform-${index}`}
      className="absolute bg-gray-600 border-t-2 border-gray-400"
      style={{
        left: `${platform.x}px`,
        top: `${platform.y}px`,
        width: '100px',
        height: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
    />
  );

  const renderTrap = (trap: Trap) => {
    const isTriggered = triggeredTraps.has(trap.id);
    const hasDisappeared = disappearingTraps.has(trap.id);

    let className = "absolute transition-all duration-300 ";
    let content = null;

    switch (trap.type) {
      case 'disappearing':
        if (hasDisappeared) return null; // Platform has disappeared
        className += isTriggered 
          ? "bg-red-500 border-t-2 border-red-300 animate-pulse" 
          : "bg-gray-600 border-t-2 border-gray-400";
        break;
        
      case 'fake':
        className += "bg-gray-500 border-t-2 border-gray-300 opacity-90";
        // Slightly different color to hint it's fake (but subtle)
        break;
        
      case 'spike':
        className += isTriggered 
          ? "bg-red-600" 
          : "bg-gray-600 border-t-2 border-gray-400";
        if (isTriggered) {
          content = (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-800"></div>
            </div>
          );
        }
        break;
        
      case 'reverse':
        className += isTriggered 
          ? "bg-purple-600 animate-spin" 
          : "bg-gray-600 border-t-2 border-gray-400";
        if (isTriggered) {
          content = (
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              ↔
            </div>
          );
        }
        break;
    }

    return (
      <div
        key={trap.id}
        className={className}
        style={{
          left: `${trap.x}px`,
          top: `${trap.y}px`,
          width: `${trap.width}px`,
          height: `${trap.height}px`,
          boxShadow: isTriggered ? '0 0 10px rgba(255,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        {content}
      </div>
    );
  };

  const renderExit = () => (
    <div
      className="absolute bg-green-500 border-2 border-green-300 animate-pulse"
      style={{
        left: `${levelData.exit.x}px`,
        top: `${levelData.exit.y}px`,
        width: '50px',
        height: '60px',
        boxShadow: '0 0 15px rgba(0,255,0,0.3)'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
        EXIT
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.1) 50px,
            rgba(255,255,255,0.1) 51px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.1) 50px,
            rgba(255,255,255,0.1) 51px
          )`
        }} />
      </div>

      {/* Platforms */}
      {levelData.platforms.map((platform, index) => renderPlatform(platform, index))}
      
      {/* Traps */}
      {levelData.traps.map(trap => renderTrap(trap))}
      
      {/* Exit */}
      {renderExit()}
    </div>
  );
};

export default Level;
