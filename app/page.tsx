'use client'

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <div className="background-image"></div>
      <div className="main-content flex-grow flex flex-col">
        <nav className="w-full p-4 navbar text-white flex justify-between items-center slide-down">
          <div className="flex items-center space-x-2 slide-down">
            <img src="/icon.png" alt="Icon" className="slide-down h-8 w-8" />
            <div className="text-lg font-bold minecraft-font slide-down">例のやつ</div>
          </div>
          <div className="flex space-x-4 minecraft-font slide-down">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </div>
        </nav>
        <div>

        </div>
      </div>
    </main>
  );
}
