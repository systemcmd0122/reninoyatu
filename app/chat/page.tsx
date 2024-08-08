'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import './styles.css';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

interface ChatData {
  id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url?: string;
}

interface UserData {
  id: string;
  username: string;
  password: string;
  avatar_url?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [loginState, setLoginState] = useState<'login' | 'register' | 'chat'>('login');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedAvatarUrl = localStorage.getItem('avatarUrl');

    if (storedUsername) {
      setUsername(storedUsername);
      setAvatarUrl(storedAvatarUrl || DEFAULT_AVATAR);
      setLoginState('chat');
    }
  }, []);

  useEffect(() => {
    if (loginState === 'chat') {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('chat_data')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('メッセージの取得中にエラーが発生しました:', error);
        } else {
          setMessages(data as ChatData[]);
        }
      };

      fetchMessages();

      const subscription = supabase
        .channel('public:chat_data')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_data',
        }, () => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loginState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !username) return;

    const { error } = await supabase
      .from('chat_data')
      .insert([
        {
          id: uuidv4(),
          content: newMessage,
          created_at: new Date().toISOString(),
          username,
          avatar_url: avatarUrl
        }
      ]);

    if (error) {
      console.error('メッセージの送信中にエラーが発生しました:', error);
    } else {
      setNewMessage('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        setError('ユーザー名またはパスワードが正しくありません');
        return;
      }

      setAvatarUrl(data.avatar_url || DEFAULT_AVATAR);
      localStorage.setItem('username', username);
      localStorage.setItem('avatarUrl', data.avatar_url || DEFAULT_AVATAR);
      setLoginState('chat');
    } catch (error) {
      console.error('ログイン中にエラーが発生しました:', error);
      setError('ログイン中にエラーが発生しました');
    }
  };

  const handleRegister = async () => {
    if (!username || !newPassword) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (data) {
        setError('このユーザー名は既に使用されています');
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: uuidv4(), 
          username, 
          password: newPassword, 
          avatar_url: DEFAULT_AVATAR 
        }]);

      if (insertError) {
        console.error('ユーザー登録中にエラーが発生しました:', insertError);
        setError('ユーザー登録中にエラーが発生しました');
        return;
      }

      setLoginState('login');
      setError('登録が完了しました。ログインしてください。');
    } catch (error) {
      console.error('ユーザー登録中にエラーが発生しました:', error);
      setError('ユーザー登録中にエラーが発生しました');
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarUrl) {
      setError('新しいアバターURLを入力してください');
      return;
    }

    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('username', username);

      if (userError) {
        console.error('ユーザーアバターの更新中にエラーが発生しました:', userError);
        setError('アバターの更新中にエラーが発生しました');
        return;
      }

      const { error: chatError } = await supabase
        .from('chat_data')
        .update({ avatar_url: avatarUrl })
        .eq('username', username);

      if (chatError) {
        console.error('チャットメッセージのアバター更新中にエラーが発生しました:', chatError);
        setError('アバターの更新中にエラーが発生しました');
        return;
      }

      setAvatarUrl(avatarUrl);
      localStorage.setItem('avatarUrl', avatarUrl);
      
    } catch (error) {
      console.error('アバターの更新中にエラーが発生しました:', error);
      setError('アバターの更新中にエラーが発生しました');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');
    setUsername('');
    setPassword('');
    setNewPassword('');
    setAvatarUrl(DEFAULT_AVATAR);
    setLoginState('login');
  };

  const handleDeleteMessages = async () => {
    try {
      const { error } = await supabase
        .from('chat_data')
        .delete()
        .neq('username', username);

      if (error) {
        console.error('メッセージの削除中にエラーが発生しました:', error);
        setError('メッセージの削除中にエラーが発生しました');
        return;
      }
    } catch (error) {
      console.error('メッセージの削除中にエラーが発生しました:', error);
      setError('メッセージの削除中にエラーが発生しました');
    }
  };

  const linkify = (text: string) => {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
  };

  const renderLogin = () => (
    <div className="chat-login-container">
      <h2>ログイン</h2>
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="chat-button" onClick={handleLogin}>ログイン</button>
      <button className="chat-button" onClick={() => setLoginState('register')}>新規登録</button>
      {error && <div className="chat-error">{error}</div>}
    </div>
  );

  const renderRegister = () => (
    <div className="chat-register-container">
      <h2>新規登録</h2>
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="新しいパスワード"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button className="chat-button" onClick={handleRegister}>登録</button>
      <button className="chat-button" onClick={() => setLoginState('login')}>ログイン画面に戻る</button>
      {error && <div className="chat-error">{error}</div>}
    </div>
  );

  const renderChat = () => (
    <div className="chat-container">
      <div className="chat-header">
        <h2>チャット</h2>
        <button className="chat-settings-button" onClick={() => setShowSettings(!showSettings)}>
          ⚙
        </button>
        {showSettings && (
          <div className="chat-settings-menu">
            <h3>設定</h3>
            <input
              type="text"
              placeholder="新しいアバター URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <button className="chat-button" onClick={handleUpdateAvatar}>アバターを更新</button>
            <button className="chat-button" onClick={handleLogout}>ログアウト</button>
          </div>
        )}
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.username === username ? 'own-message' : ''}`}>
            <img src={msg.avatar_url || DEFAULT_AVATAR} alt="Avatar" className="chat-avatar" />
            <div className="chat-message-content" dangerouslySetInnerHTML={{ __html: linkify(msg.content) }} />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <textarea
          className="chat-textarea"
          placeholder="メッセージを入力..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-button" onClick={handleSendMessage}>送信</button>
      </div>
    </div>
  );

  return (
    <div>
      {loginState === 'login' && renderLogin()}
      {loginState === 'register' && renderRegister()}
      {loginState === 'chat' && renderChat()}
    </div>
  );
}

export default Chat;