// src/pages/contact.tsx
'use client'
import React from 'react';
import Link from 'next/link';
import Clicker from '../components/Clicker';

const Enjoy = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 背景画像 */}
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
          <Clicker />
        </main>
        <footer className="footer bg-gray-800 text-white p-4 text-center">
          <p>© 2024 例のやつ. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Enjoy;