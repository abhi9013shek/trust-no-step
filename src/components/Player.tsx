import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Position, LevelData, Trap } from './Game';

interface PlayerProps {
  position: Position;
  onPositionChange: (pos: Position) => void;
  onDeath: () => void;
  onLevelComplete: () => void;
  levelData: LevelData;
  reversedControls: boolean;
  triggeredTraps: Set<string>;
}

const PLAYER_SIZE = { width: 20, height: 30 };
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const PLATFORM_HEIGHT = 20;

const Player: React.FC<PlayerProps> = ({
  position,
  onPositionChange,
  onDeath,
  onLevelComplete,
  levelData,
  reversedControls,
  triggeredTraps
}) => {
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const [isGrounded, setIsGrounded] = useState(false);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  // Use refs to access current values in the game loop
  const positionRef = useRef(position);
  const velocityRef = useRef(velocity);
  const keysRef = useRef(keys);

  // Update refs when state changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set([...prev, e.key.toLowerCase()]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check collision with platforms
  const checkPlatformCollision = useCallback((pos: Position, vel: Position) => {
    const playerRect = {
      left: pos.x,
      right: pos.x + PLAYER_SIZE.width,
      top: pos.y,
      bottom: pos.y + PLAYER_SIZE.height
    };

    let grounded = false;
    let newVel = { ...vel };

    console.log('Player position:', pos, 'Player rect:', playerRect);

    // Check regular platforms
    levelData.platforms.forEach((platform, index) => {
      const platformRect = {
        left: platform.x,
        right: platform.x + 100,
        top: platform.y,
        bottom: platform.y + PLATFORM_HEIGHT
      };

      // Check if player is colliding with platform
      if (playerRect.right > platformRect.left &&
          playerRect.left < platformRect.right &&
          playerRect.bottom > platformRect.top &&
          playerRect.top < platformRect.bottom) {
        
        console.log('Collision with regular platform', index, platform);
        // Landing on top
        if (vel.y > 0 && playerRect.top < platformRect.top) {
          pos.y = platformRect.top - PLAYER_SIZE.height;
          newVel.y = 0;
          grounded = true;
        }
      }
    });

    // Check trap platforms
    levelData.traps.forEach(trap => {
      const trapRect = {
        left: trap.x,
        right: trap.x + trap.width,
        top: trap.y,
        bottom: trap.y + trap.height
      };

      console.log('Checking trap:', trap.type, 'at', trap.x, trap.y, 'trapRect:', trapRect);

      if (trap.type === 'fake' || (trap.type === 'disappearing' && !triggeredTraps.has(trap.id))) {
        if (playerRect.right > trapRect.left &&
            playerRect.left < trapRect.right &&
            playerRect.bottom > trapRect.top &&
            playerRect.top < trapRect.bottom) {
          
          console.log('Player collided with trap:', trap.type, trap.id);
          
          if (trap.type === 'fake') {
            // Fake platform - player falls through immediately
            console.log('Fake platform triggered - calling onDeath');
            onDeath();
            return { pos, vel: newVel, grounded: false };
          } else if (trap.type === 'disappearing') {
            // Disappearing platform - works initially
            if (vel.y > 0 && playerRect.top < trapRect.top) {
              pos.y = trapRect.top - PLAYER_SIZE.height;
              newVel.y = 0;
              grounded = true;
            }
          }
        }
      }

      // Check other trap types
      if (trap.type === 'spike' || trap.type === 'reverse') {
        if (playerRect.right > trapRect.left &&
            playerRect.left < trapRect.right &&
            playerRect.bottom > trapRect.top &&
            playerRect.top < trapRect.bottom) {
          
          console.log('Player hit spike/reverse trap:', trap.type);
          // Trigger the trap
          if (trap.type === 'spike') {
            onDeath();
            return { pos, vel: newVel, grounded };
          }
        }
      }
    });

    return { pos, vel: newVel, grounded };
  }, [levelData, onDeath, triggeredTraps]);

  // Check if player reached the exit
  const checkExit = useCallback((pos: Position) => {
    const exitRect = {
      left: levelData.exit.x,
      right: levelData.exit.x + 50,
      top: levelData.exit.y,
      bottom: levelData.exit.y + 60
    };

    const playerRect = {
      left: pos.x,
      right: pos.x + PLAYER_SIZE.width,
      top: pos.y,
      bottom: pos.y + PLAYER_SIZE.height
    };

    if (playerRect.right > exitRect.left &&
        playerRect.left < exitRect.right &&
        playerRect.bottom > exitRect.top &&
        playerRect.top < exitRect.bottom) {
      onLevelComplete();
    }
  }, [levelData.exit, onLevelComplete]);

  // Game loop - now with stable dependencies
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const currentKeys = keysRef.current;
      const currentVelocity = velocityRef.current;
      const currentPosition = positionRef.current;
      
      // Apply gravity and handle movement
      let newVel = { ...currentVelocity };
      newVel.y += GRAVITY;

      // Handle horizontal movement
      const leftPressed = currentKeys.has('arrowleft') || currentKeys.has('a');
      const rightPressed = currentKeys.has('arrowright') || currentKeys.has('d');
      
      if (leftPressed && !rightPressed) {
        newVel.x = reversedControls ? MOVE_SPEED : -MOVE_SPEED;
      } else if (rightPressed && !leftPressed) {
        newVel.x = reversedControls ? -MOVE_SPEED : MOVE_SPEED;
      } else {
        newVel.x = 0;
      }

      // Calculate new position
      let newPos = {
        x: currentPosition.x + newVel.x,
        y: currentPosition.y + newVel.y
      };

      // Check collisions
      const collision = checkPlatformCollision(newPos, newVel);
      newPos = collision.pos;
      setVelocity(collision.vel);
      setIsGrounded(collision.grounded);

      // Check boundaries
      if (newPos.x < 0) newPos.x = 0;
      if (newPos.x > 850) newPos.x = 850;

      // Check if fallen off the world
      if (newPos.y > 600) {
        onDeath();
        return;
      }

      // Check exit
      checkExit(newPos);

      // Update position
      onPositionChange(newPos);
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [checkPlatformCollision, checkExit, onDeath, reversedControls, onPositionChange]);

  // Handle jumping
  useEffect(() => {
    const jumpPressed = keys.has(' ') || keys.has('w') || keys.has('arrowup');
    
    if (jumpPressed && isGrounded) {
      setVelocity(prev => ({ ...prev, y: JUMP_FORCE }));
      setIsGrounded(false);
    }
  }, [keys, isGrounded]);

  return (
    <div
      className={`absolute bg-blue-400 rounded-sm transition-all duration-75 ${
        reversedControls ? 'animate-pulse' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${PLAYER_SIZE.width}px`,
        height: `${PLAYER_SIZE.height}px`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
    >
      {/* Player "face" */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
      <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"></div>
    </div>
  );
};

export default Player;
