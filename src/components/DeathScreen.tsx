
import React from 'react';

interface DeathScreenProps {
  message: string;
  onRestart: () => void;
  lives: number;
}

const DeathScreen: React.FC<DeathScreenProps> = ({ message, onRestart, lives }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center text-white max-w-md px-8">
        {/* Death Icon */}
        <div className="text-6xl mb-6 animate-bounce">💀</div>
        
        {/* Death Message */}
        <h2 className="text-3xl font-bold mb-4 text-red-400">
          {lives > 0 ? 'OOPS!' : 'GAME OVER'}
        </h2>
        
        <p className="text-lg mb-6 text-gray-300 italic">
          "{message}"
        </p>

        {/* Lives Remaining */}
        {lives > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Lives Remaining:</p>
            <div className="flex justify-center space-x-1">
              {Array.from({ length: lives }, (_, i) => (
                <span key={i} className="text-2xl text-red-500">❤️</span>
              ))}
            </div>
          </div>
        )}

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {lives > 0 ? 'Try Again (R)' : 'Restart Game (R)'}
        </button>

        {/* Helpful Tip */}
        <div className="mt-8 text-xs text-gray-500">
          <p>Pro Tip: That platform you trusted? Maybe don't.</p>
          <p className="mt-1">Press R anytime to restart the level</p>
        </div>

        {/* Glitch Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="w-full h-0.5 bg-red-500 opacity-60"
            style={{
              top: `${Math.random() * 100}%`,
              animation: 'glitch 2s infinite'
            }}
          />
          <div 
            className="w-full h-0.5 bg-blue-500 opacity-40"
            style={{
              top: `${Math.random() * 100}%`,
              animation: 'glitch 1.5s infinite reverse'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DeathScreen;
