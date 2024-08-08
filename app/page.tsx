import React from 'react';
import Link from 'next/link';

const HOME = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 背景画像 */}
      <div className="background-image"></div>
      <div className="main-content flex-grow flex flex-col">
        <nav className="w-full p-4 navbar text-white flex justify-between items-center slide-down">
          <div className="flex items-center space-x-2 slide-down">
            <img src="/icon.png" alt="Icon" className="slide-down h-8 w-8" />
            <div className="text-lg font-bold minecraft-font slide-down">例のやつ</div>
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
          {/* ヒーローセクション */}
          <header className="hero-section flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-6xl font-bold text-white mb-4">例のやつ</h1>
            <p className="text-2xl text-white mb-8">ウェブサイトの主なテーマや目的をここに書きます。</p>
            <Link href="/enjoy" className="btn-primary">今すぐ始める</Link>
          </header>

          {/* サイトの概要 */}
          <section className="overview-section bg-white bg-opacity-90 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center">
            <h2 className="text-4xl font-bold mb-4">サイトの概要</h2>
            <p className="text-xl mb-8">このサイトが提供する内容や期待できることを簡潔に説明します。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="feature-item p-4 bg-gray-200 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2">特徴1</h3>
                <p>特徴1の説明をここに書きます。</p>
              </div>
              <div className="feature-item p-4 bg-gray-200 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2">特徴2</h3>
                <p>特徴2の説明をここに書きます。</p>
              </div>
              <div className="feature-item p-4 bg-gray-200 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2">特徴3</h3>
                <p>特徴3の説明をここに書きます。</p>
              </div>
            </div>
          </section>

          {/* 最新情報やニュース */}
          <section className="news-section bg-gray-100 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center my-8">
            <h2 className="text-4xl font-bold mb-4">最新情報やニュース</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="news-item p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">ニュース1</h3>
                <p>ニュース1の詳細情報をここに書きます。</p>
              </div>
              <div className="news-item p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">ニュース2</h3>
                <p>ニュース2の詳細情報をここに書きます。</p>
              </div>
            </div>
          </section>

          {/* おすすめコンテンツ */}
          <section className="recommended-section bg-white bg-opacity-90 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center my-8">
            <h2 className="text-4xl font-bold mb-4">おすすめコンテンツ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="recommended-item p-4 bg-gray-200 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2">コンテンツ1</h3>
                <p>コンテンツ1の説明をここに書きます。</p>
              </div>
              <div className="recommended-item p-4 bg-gray-200 rounded-lg">
                <h3 className="text-2xl font-semibold mb-2">コンテンツ2</h3>
                <p>コンテンツ2の説明をここに書きます。</p>
              </div>
            </div>
          </section>

          {/* コンタクト情報 */}
          <section className="contact-section bg-white bg-opacity-90 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center my-8">
            <h2 className="text-4xl font-bold mb-4">お問い合わせ</h2>
            <p className="text-xl mb-4">お問い合わせはこちらからどうぞ。</p>
            <form className="contact-form grid grid-cols-1 gap-4">
              <input type="text" className="p-2 rounded-lg border border-gray-300" placeholder="お名前" />
              <input type="email" className="p-2 rounded-lg border border-gray-300" placeholder="メールアドレス" />
              <textarea className="p-2 rounded-lg border border-gray-300" rows={4} placeholder="メッセージ"></textarea>
              <button type="submit" className="btn-primary">送信</button>
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

export default HOME;
