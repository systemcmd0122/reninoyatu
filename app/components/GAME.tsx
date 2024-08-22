// src/components/SnakeGame.tsx
import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

interface SnakePart {
  x: number;
  y: number;
}

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<SnakePart[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [food, setFood] = useState<SnakePart>({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': setDirection('UP'); break;
        case 'ArrowDown': setDirection('DOWN'); break;
        case 'ArrowLeft': setDirection('LEFT'); break;
        case 'ArrowRight': setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      moveSnake();
      checkCollision();
      drawGame();
    }, 100);

    return () => clearInterval(gameLoop);
  }, [snake, food, gameOver]);

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    newSnake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      setFood(getRandomFood());
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  const checkCollision = () => {
    const head = snake[0];
    if (
      head.x < 0 || head.x >= GRID_SIZE ||
      head.y < 0 || head.y >= GRID_SIZE ||
      snake.slice(1).some(part => part.x === head.x && part.y === head.y)
    ) {
      setGameOver(true);
    }
  };

  const getRandomFood = (): SnakePart => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(part => {
      ctx.fillRect(part.x * CELL_SIZE, part.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        style={{ border: '1px solid black' }}
      />
      {gameOver && <div>Game Over!</div>}
    </div>
  );
};

export default SnakeGame;