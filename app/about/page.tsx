'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaYoutube, FaDiscord, FaTwitter } from 'react-icons/fa';
import { SiScratch } from 'react-icons/si';

const About = () => {
  const socialLinks = [
    { name: 'YouTube', icon: FaYoutube, url: 'https://www.youtube.com/@%E4%BE%8B%E3%81%AE%E3%83%A4%E3%83%84', color: 'bg-red-600' },
    { name: 'Discord', icon: FaDiscord, url: 'https://discord.gg/mQQhVRpuqa', color: 'bg-indigo-600' },
    { name: 'Scratch', icon: SiScratch, url: 'https://scratch.mit.edu/users/min-brother/', color: 'bg-orange-500' },
    { name: 'X', icon: FaTwitter, url: 'https://twitter.com/min_brother2158', color: 'bg-blue-500' }, 
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="background-image"></div>
      
      <div className="main-content flex flex-col items-center justify-center">
        <nav className="navbar w-full p-4 text-white flex justify-between items-center slide-down">
          <div className="flex items-center space-x-2">
            <img src="/icon.png" alt="Icon" className="h-8 w-8" />
            <div className="text-lg font-bold minecraft-font">例のやつ：About</div>
          </div>
          <div className="flex space-x-4 minecraft-font">
            <Link href="/" className="nav-link"><span>Home</span></Link>
            <Link href="/about" className="nav-link"><span>About</span></Link>
            <Link href="/contact" className="nav-link"><span>Contact</span></Link>
            <Link href="/enjoy" className="nav-link"><span>Enjoy</span></Link>
            <Link href="/chat" className="nav-link">Chat</Link>
          </div>
        </nav>

        <main className="flex-grow flex flex-col items-center justify-center w-full p-8 space-y-12">
          <motion.div
            className="bg-white bg-opacity-90 rounded-lg shadow-lg p-10 w-full max-w-6xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
              <img src="/icon.png" alt="Icon" className="w-64 h-64 rounded-full shadow-md" />
              <div className="flex-grow text-black">
                <h1 className="text-4xl font-bold mb-8 text-center lg:text-left minecraft-font">自己紹介</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="intro-item">
                    <p className="text-2xl font-semibold minecraft-font mb-2">名前:</p>
                    <p className="text-xl">例のやつ</p>
                  </div>
                  <div className="intro-item">
                    <p className="text-2xl font-semibold minecraft-font mb-2">身長:</p>
                    <p className="text-xl">140cmくらい</p>
                  </div>
                  <div className="intro-item">
                    <p className="text-2xl font-semibold minecraft-font mb-2">趣味:</p>
                    <p className="text-xl">物作り、ゲーム、ペン回し</p>
                  </div>
                  <div className="intro-item">
                    <p className="text-2xl font-semibold minecraft-font mb-2">好物:</p>
                    <p className="text-xl">ジャンクフード、みかん</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="w-full max-w-6xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-white minecraft-font">SNSリンク</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center p-6 rounded-lg shadow-lg ${link.color} text-white transition-transform hover:scale-105`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <link.icon className="text-4xl mr-4" />
                  <span className="text-2xl font-bold minecraft-font">{link.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="w-full max-w-6xl mt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-white minecraft-font">座右の銘</h2>
            <div className="flex flex-col items-center">
              <img src="/meigen.png" alt="座右の銘" className="w-full h-auto max-w-3xl rounded-lg shadow-lg" />
              <p className="text-2xl font-bold text-white text-center mt-4 minecraft-font">「みかんはこの世の心理である」</p>
            </div>
          </motion.div>
        </main>

        <footer className="w-full bg-gray-800 text-white p-4 text-center">
          <p>© 2024 例のやつ. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default About;