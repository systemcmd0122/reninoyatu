'use client'
import React from 'react';
import Link from 'next/link';

const Contact = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 背景画像 */}
      <div className="background-image"></div>
      <div className="main-content flex-grow flex flex-col">
        <nav className="w-full p-4 navbar text-white flex justify-between items-center slide-down">
          <div className="flex items-center space-x-2 slide-down">
            <img src="/icon.png" alt="Icon" className="slide-down h-8 w-8" />
            <div className="text-lg font-bold minecraft-font slide-down rainbow-border">例のやつ</div>
          </div>
          <div className="flex space-x-4 minecraft-font slide-down">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
            <Link href="/enjoy" className='nav-link'>Enjoy</Link>
          </div>
        </nav>
        <main className="flex-grow flex items-center justify-center">
          <h1 className="text-2xl font-bold">開発中</h1>
        </main>
      </div>
    </div>
  );
};

export default Contact;
