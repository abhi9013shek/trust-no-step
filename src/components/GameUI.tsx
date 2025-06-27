
import React from 'react';

interface GameUIProps {
  lives: number;
  level: number;
  levelName: string;
  reversedControls: boolean;
}

const GameUI: React.FC<GameUIProps> = ({ lives, level, levelName, reversedControls }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4">
      {/* Top UI Bar */}
      <div className="flex justify-between items-center text-white">
        {/* Lives */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">Lives:</span>
          <div className="flex space-x-1">
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={`text-2xl ${
                  i < lives ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Level Info */}
        <div className="text-center">
          <div className="text-sm opacity-75">Level {level}</div>
          <div className={`text-lg font-bold ${reversedControls ? 'animate-pulse text-purple-400' : ''}`}>
            {levelName}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="text-right">
          {reversedControls && (
            <div className="text-purple-400 animate-pulse font-bold text-sm">
              CONTROLS REVERSED!
            </div>
          )}
        </div>
      </div>

      {/* Glitch Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="w-full h-1 bg-red-500 opacity-30 animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            animation: 'glitch 3s infinite'
          }}
        />
      </div>

      {/* Warning Messages */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-yellow-400 text-sm opacity-75 animate-pulse">
          Trust Nothing • Question Everything
        </div>
      </div>
    </div>
  );
};

export default GameUI;
