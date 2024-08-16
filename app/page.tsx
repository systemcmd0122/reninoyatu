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
            <div className="text-lg font-bold minecraft-font slide-down">例のやつ：Home</div>
          </div>
          <div className="flex space-x-4 minecraft-font slide-down">
            <Link href="/" className="nav-link"><span>Home</span></Link>
            <Link href="/about" className="nav-link"><span>About</span></Link>
            <Link href="/contact" className="nav-link"><span>Contact</span></Link>
            <Link href="/enjoy" className="nav-link"><span>Enjoy</span></Link>
            <Link href="/chat" className="nav-link">Chat</Link>
          </div>
        </nav>
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
          {/* ウェルカムセクション */}
          <section className="welcome-section bg-black bg-opacity-70 text-white rounded-lg shadow-lg p-10 w-full max-w-6xl text-center mb-8">
            <h2 className="text-5xl font-bold mb-6">ようこそ！</h2>
            <p className="text-xl mb-6">「例のヤツ」のホームページへようこそ。このサイトでは、あなたが興味を持っている情報を見つけたり、参加したりできる様々な機能があります。</p>
            <p className="text-lg mb-8">さあ、以下のセクションで詳しく見てみましょう！</p>
          </section>

          {/* 機能紹介セクション */}
          <section className="overview-section bg-black bg-opacity-60 text-white rounded-lg shadow-lg p-10 w-full max-w-6xl text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">このサイトの機能</h2>
            <p className="text-xl mb-8">このサイトでは、以下の機能を利用することができます：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="feature-item p-6 bg-black bg-opacity-70 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">チャット</h3>
                <p>メールアドレスなしでユーザー名とパスワードだけで、オンラインで様々な人とリアルタイムでチャットができます。</p>
              </div>
              <div className="feature-item p-6 bg-black bg-opacity-70 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">楽しむ</h3>
                <p>みんなで「例のやつ」を押しまくって、一定数に達すると特別なボーナスがもらえるかも！</p>
              </div>
            </div>
          </section>

          {/* 最新情報セクション */}
          <section className="news-section bg-zinc-800 bg-opacity-70 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">最新情報やニュース</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="news-item p-6 bg-white bg-opacity-90 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">最新ニュース1</h3>
                <p>最新ニュース1の詳細情報をここに記載します。サイトの最新情報をお見逃しなく！</p>
              </div>
              <div className="news-item p-6 bg-white bg-opacity-90 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">最新ニュース2</h3>
                <p>最新ニュース2の詳細情報をここに記載します。新しいお知らせやイベント情報をご確認ください。</p>
              </div>
            </div>
          </section>

          {/* おすすめコンテンツセクション */}
          <section className="recommended-section bg-zinc-800 bg-opacity-70 rounded-lg shadow-lg p-10 w-full max-w-6xl text-center">
            <h2 className="text-4xl font-bold mb-4">おすすめコンテンツ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="recommended-item p-6 bg-gray-200 bg-opacity-90 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">コンテンツ1</h3>
                <p>コンテンツ1の説明をここに記載します。興味深い内容がたくさんありますので、ぜひチェックしてみてください。</p>
              </div>
              <div className="recommended-item p-6 bg-gray-200 bg-opacity-90 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-2">コンテンツ2</h3>
                <p>コンテンツ2の説明をここに記載します。皆さんに役立つ情報や面白いコンテンツが満載です。</p>
              </div>
            </div>
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
