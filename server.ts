// src/server/server.ts
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

interface Player {
  x: number;
  y: number;
  score: number;
}

const players: { [key: string]: Player } = {};
let food = { x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 600) };

function generateFood() {
  food = { x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 600) };
  io.emit('foodLocation', food);
}

io.on('connection', (socket: Socket) => {
  console.log('a user connected');

  // 新しいプレイヤーを追加
  players[socket.id] = {
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
    score: 0
  };

  // 現在のプレイヤーの状態を送信
  socket.emit('currentPlayers', players);

  // 新しい食べ物の位置を送信
  socket.emit('foodLocation', food);

  // 他のプレイヤーに新しいプレイヤーを通知
  socket.broadcast.emit('newPlayer', {
    playerId: socket.id,
    x: players[socket.id].x,
    y: players[socket.id].y,
    score: players[socket.id].score
  });

  // プレイヤーの移動を処理
  socket.on('playerMovement', (movementData: { x: number; y: number }) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // 他のプレイヤーにこのプレイヤーの移動を送信
    socket.broadcast.emit('playerMoved', {
      playerId: socket.id,
      x: players[socket.id].x,
      y: players[socket.id].y,
      score: players[socket.id].score
    });
  });

  // 食べ物を食べた時の処理
  socket.on('foodEaten', () => {
    players[socket.id].score += 10;
    socket.emit('scoreUpdate', players[socket.id].score);
    generateFood();
  });

  // プレイヤーが接続を切断したときの処理
  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete players[socket.id];
    io.emit('disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});