// src/app/enjoy/page.tsx
'use client'
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Phaser from 'phaser';
import io, { Socket } from 'socket.io-client';

interface PlayerInfo {
  x: number;
  y: number;
  playerId: string;
  score: number;
}

interface CustomImage extends Phaser.Physics.Arcade.Image {
  playerId?: string;
}

const Enjoy = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      socketRef.current = io('http://localhost:3001');

      class MainScene extends Phaser.Scene {
        player: Phaser.Physics.Arcade.Image | null = null;
        cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
        otherPlayers: Phaser.Physics.Arcade.Group | null = null;
        foods: Phaser.Physics.Arcade.Group | null = null;
        scoreText: Phaser.GameObjects.Text | null = null;
        score: number = 0;

        constructor() {
          super({ key: 'MainScene' });
        }

        preload() {
          this.load.image('player', '/snake-head.png');
          this.load.image('food', '/food.png');
        }

        create() {
          this.otherPlayers = this.physics.add.group();
          this.foods = this.physics.add.group();
          this.cursors = this.input.keyboard?.createCursorKeys() ?? null;

          this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#fff' });

          socketRef.current?.on('currentPlayers', (players: Record<string, PlayerInfo>) => {
            Object.keys(players).forEach((id) => {
              if (id === socketRef.current?.id) {
                this.addPlayer(players[id]);
              } else {
                this.addOtherPlayers(players[id]);
              }
            });
          });

          socketRef.current?.on('newPlayer', (playerInfo: PlayerInfo) => {
            this.addOtherPlayers(playerInfo);
          });

          socketRef.current?.on('disconnected', (playerId: string) => {
            this.otherPlayers?.getChildren().forEach((otherPlayer: Phaser.GameObjects.GameObject) => {
              if ((otherPlayer as CustomImage).playerId === playerId) {
                otherPlayer.destroy();
              }
            });
          });

          socketRef.current?.on('playerMoved', (playerInfo: PlayerInfo) => {
            this.otherPlayers?.getChildren().forEach((otherPlayer: Phaser.GameObjects.GameObject) => {
              if ((otherPlayer as CustomImage).playerId === playerInfo.playerId) {
                (otherPlayer as CustomImage).setPosition(playerInfo.x, playerInfo.y);
              }
            });
          });

          socketRef.current?.on('foodLocation', (foodInfo: { x: number; y: number }) => {
            this.foods?.clear(true, true);
            const food = this.foods?.create(foodInfo.x, foodInfo.y, 'food');
            food?.setDisplaySize(15, 15);
          });

          socketRef.current?.on('scoreUpdate', (newScore: number) => {
            this.score = newScore;
            this.scoreText?.setText(`Score: ${this.score}`);
          });

          if (this.player && this.foods) {
            this.physics.add.overlap(
              this.player,
              this.foods,
              this.eatFood as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
              undefined,
              this
            );
          }
        }

        update() {
          if (this.player && this.cursors) {
            const speed = 5;
            if (this.cursors.left.isDown) {
              this.player.setVelocityX(-speed);
            } else if (this.cursors.right.isDown) {
              this.player.setVelocityX(speed);
            } else {
              this.player.setVelocityX(0);
            }

            if (this.cursors.up.isDown) {
              this.player.setVelocityY(-speed);
            } else if (this.cursors.down.isDown) {
              this.player.setVelocityY(speed);
            } else {
              this.player.setVelocityY(0);
            }

            socketRef.current?.emit('playerMovement', {
              x: this.player.x,
              y: this.player.y,
            });
          }
        }

        addPlayer(playerInfo: PlayerInfo) {
          this.player = this.physics.add.image(playerInfo.x, playerInfo.y, 'player');
          this.player.setDisplaySize(30, 30);
          this.player.setCollideWorldBounds(true);
          this.score = playerInfo.score;
          this.scoreText?.setText(`Score: ${this.score}`);
        }

        addOtherPlayers(playerInfo: PlayerInfo) {
          const otherPlayer = this.physics.add.image(playerInfo.x, playerInfo.y, 'player') as CustomImage;
          otherPlayer.setDisplaySize(30, 30);
          otherPlayer.setTint(0xff0000);
          otherPlayer.playerId = playerInfo.playerId;
          this.otherPlayers?.add(otherPlayer);
        }

        eatFood(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, food: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
          if (food instanceof Phaser.GameObjects.GameObject) {
            food.destroy();
            socketRef.current?.emit('foodEaten');
          }
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: 800,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scene: [MainScene],
      };

      gameRef.current = new Phaser.Game(config);

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
        }
        socketRef.current?.disconnect();
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="background-image"></div>
      <div className="main-content flex-grow flex flex-col">
        <nav className="w-full p-4 navbar text-white flex justify-between items-center slide-down">
          <div className="flex items-center space-x-2 slide-down">
            <img src="/icon.png" alt="Icon" className="slide-down h-8 w-8" />
            <div className="text-lg font-bold minecraft-font slide-down">例のやつ：Enjoy</div>
          </div>
          <div className="flex space-x-4 minecraft-font slide-down">
            <Link href="/" className="nav-link"><span>Home</span></Link>
            <Link href="/about" className="nav-link"><span>About</span></Link>
            <Link href="/contact" className="nav-link"><span>Contact</span></Link>
            <Link href="/enjoy" className="nav-link"><span>Enjoy</span></Link>
            <Link href="/chat" className="nav-link">Chat</Link>
          </div>
        </nav>
        <main className="flex-grow flex flex-col items-center justify-center">
          <div id="game-container"></div>
        </main>
        <footer className="footer bg-gray-800 text-white p-4 text-center">
          <p>© 2024 例のやつ. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Enjoy;