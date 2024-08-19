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
            <div className="text-lg font-bold minecraft-font slide-down rainbow-border">例のやつ：Contact</div>
          </div>
          <div className="flex space-x-4 minecraft-font slide-down">
          <Link href="/" className="nav-link"><span>Home</span></Link>
            <Link href="/about" className="nav-link"><span>About</span></Link>
            <Link href="/contact" className="nav-link"><span>Contact</span></Link>
            <Link href="/enjoy" className="nav-link"><span>Enjoy</span></Link>
            <Link href="/chat" className="nav-link">Chat</Link>
          </div>
        </nav>
        <main className="flex-grow flex items-center justify-center">
        {/* コンタクト情報 */}
        <section className="contact-section bg-zinc-800 bg-opacity-90 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center my-8">
            <h2 className="text-4xl font-bold mb-4">お問い合わせ</h2>
            <p className="text-xl mb-4">お問い合わせはこちらからどうぞ。</p>
            <form className="contact-form grid grid-cols-1 gap-4">
              <input type="text" className="p-2 rounded-lg border border-gray-300" placeholder="お名前" />
              <input type="email" className="p-2 rounded-lg border border-gray-300" placeholder="メールアドレス" />
              <textarea className="p-2 rounded-lg border border-gray-300" rows={4} placeholder="メッセージ"></textarea>
              <button type="submit" className="btn-primary bg-zinc-700">送信</button>
            </form>
          </section>
        </main>
        <footer className="footer bg-gray-800 text-white p-4 text-center">
          <p>© 2024 例のやつ. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Contact;
