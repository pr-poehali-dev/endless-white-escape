import { useEffect, useRef, useState } from 'react';

const SPRITE_SIZE = 64;
const ANIMATION_SPEED = 150;

type Direction = 'down' | 'left' | 'right' | 'up';

const SPRITE_POSITIONS = {
  down: [0, 4, 8, 12],
  right: [1, 5, 9, 13],
  left: [2, 6, 10, 14],
  up: [3, 7, 11, 15]
};

export default function Index() {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [frame, setFrame] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const lastMoveTime = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA==';
    audio.loop = true;
    audio.volume = 0.3;
    
    const playAudio = () => {
      audio.play().catch(() => {});
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
    
    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);
    
    setTimeout(() => setShowInstructions(false), 5000);

    return () => {
      audio.pause();
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const movePlayer = () => {
      const now = Date.now();
      const keys = keysPressed.current;
      
      if (keys.size === 0) {
        setIsMoving(false);
        setFrame(0);
        animationRef.current = requestAnimationFrame(movePlayer);
        return;
      }

      setIsMoving(true);
      
      let dx = 0;
      let dy = 0;
      let newDirection: Direction = direction;

      if (keys.has('w') || keys.has('arrowup')) {
        dy -= 3;
        newDirection = 'up';
      }
      if (keys.has('s') || keys.has('arrowdown')) {
        dy += 3;
        newDirection = 'down';
      }
      if (keys.has('a') || keys.has('arrowleft')) {
        dx -= 3;
        newDirection = 'left';
      }
      if (keys.has('d') || keys.has('arrowright')) {
        dx += 3;
        newDirection = 'right';
      }

      if (dx !== 0 || dy !== 0) {
        setPlayerPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setDirection(newDirection);

        if (now - lastMoveTime.current > ANIMATION_SPEED) {
          setFrame(prev => (prev + 1) % 4);
          lastMoveTime.current = now;
        }
      }

      animationRef.current = requestAnimationFrame(movePlayer);
    };

    animationRef.current = requestAnimationFrame(movePlayer);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [direction]);

  const spriteIndex = isMoving ? SPRITE_POSITIONS[direction][frame] : SPRITE_POSITIONS[direction][0];
  const spriteCol = Math.floor(spriteIndex / 4);
  const spriteRow = spriteIndex % 4;

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none select-none">
        <h1 
          className="text-2xl mb-2 tracking-wider" 
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          PIXEL ESCAPE
        </h1>
        <p 
          className="text-sm text-gray-600"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {Math.abs(Math.round(playerPos.x / 10))}, {Math.abs(Math.round(playerPos.y / 10))}
        </p>
      </div>

      {showInstructions && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none select-none animate-fade-in"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <p className="text-lg mb-4">WASD или стрелки для движения</p>
          <p className="text-sm text-gray-500">Найди выход из белого пространства...</p>
        </div>
      )}

      <div 
        className="absolute transition-transform duration-75 ease-linear"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% - ${playerPos.x}px), calc(-50% - ${playerPos.y}px))`,
          width: '10000px',
          height: '10000px',
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: `${playerPos.x % 100}px ${playerPos.y % 100}px`
        }} />

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gray-300 rounded-full"
            style={{
              left: `${5000 + (i * 400) - (playerPos.x * 0.5)}px`,
              top: `${5000 + (i * 300) - (playerPos.y * 0.5)}px`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 z-10"
        style={{
          width: `${SPRITE_SIZE}px`,
          height: `${SPRITE_SIZE}px`,
          imageRendering: 'pixelated',
          transform: `translateX(-50%) translateY(-${SPRITE_SIZE}px)`,
        }}
      >
        <div
          style={{
            width: `${SPRITE_SIZE}px`,
            height: `${SPRITE_SIZE}px`,
            backgroundImage: `url(https://cdn.poehali.dev/files/cdfc8d87-d623-4192-9c3a-212a2a89fa4a.jpg)`,
            backgroundPosition: `-${spriteCol * SPRITE_SIZE}px -${spriteRow * SPRITE_SIZE}px`,
            backgroundSize: `${SPRITE_SIZE * 4}px auto`,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black text-white pointer-events-none select-none"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px' }}
      >
        Выхода нет. Только белое пространство.
      </div>
    </div>
  );
}