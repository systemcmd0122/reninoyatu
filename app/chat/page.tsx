"use client";

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
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

export default function Chat() {
  const [messages, setMessages] = useState<ChatData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loginState, setLoginState] = useState<'login' | 'register' | 'chat'>('login');
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatVisible) {
      fetchMessages();

      const subscription = supabase
        .channel('public:chat_data')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_data',
        }, (payload) => {
          setMessages(prevMessages => [...prevMessages, payload.new as ChatData]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isChatVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          avatar_url: avatarUrl || DEFAULT_AVATAR
        }
      ]);

    if (error) {
      console.error('メッセージの送信中にエラーが発生しました:', error);
    } else {
      setNewMessage('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
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
      setIsChatVisible(true);
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
        setError('そのユーザー名はすでに使用されています');
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          username,
          password: newPassword,
          avatar_url: avatarUrl || DEFAULT_AVATAR
        }]);

      if (insertError) {
        console.error('ユーザーの登録中にエラーが発生しました:', insertError);
        setError('ユーザーの登録中にエラーが発生しました');
      } else {
        setLoginState('login');
      }
    } catch (error) {
      console.error('登録中にエラーが発生しました:', error);
      setError('登録中にエラーが発生しました');
    }
  };

  const handleLogout = () => {
    setIsChatVisible(false);
    setLoginState('login');
    setMessages([]);
  };

  const handleUpdateAvatar = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('username', username);

      if (error) {
        console.error('アバターの更新中にエラーが発生しました:', error);
        setError('アバターの更新中にエラーが発生しました');
      } else {
        setAvatarUrl(avatarUrl);
        setShowSettings(false);
      }
    } catch (error) {
      console.error('アバターの更新中にエラーが発生しました:', error);
      setError('アバターの更新中にエラーが発生しました');
    }
  };

  const renderChat = () => (
    <div className="chat-container">
      <div className="chat-header">
        <h2>チャット</h2>
        <button className="chat-settings-button" onClick={() => setShowSettings(!showSettings)}>
          ⚙️
        </button>
        {showSettings && (
          <div className="chat-settings-menu">
            <input
              type="text"
              placeholder="新しいアバターURL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <button className="chat-button" onClick={handleUpdateAvatar}>アバターを更新</button>
            <button className="chat-button" onClick={handleLogout}>ログアウト</button>
          </div>
        )}
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.username === username ? 'chat-message-right' : 'chat-message-left'
            }`}
          >
            <img src={message.avatar_url || DEFAULT_AVATAR} alt="avatar" className="chat-avatar" />
            <div className="chat-message-content">
              <strong>{message.username}</strong>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <textarea
          className="chat-textarea"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
        />
        <button className="chat-button" onClick={handleSendMessage}>送信</button>
      </div>
    </div>
  );

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
      <div className="chat-error">{error}</div>
      <button className="chat-button" onClick={() => setLoginState('register')}>新規登録</button>
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
        placeholder="パスワード"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="アバターURL (オプション)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
      />
      <button className="chat-button" onClick={handleRegister}>登録</button>
      <div className="chat-error">{error}</div>
      <button className="chat-button" onClick={() => setLoginState('login')}>ログインへ戻る</button>
    </div>
  );

  return (
    <div>
      {loginState === 'chat' ? renderChat() : loginState === 'register' ? renderRegister() : renderLogin()}
    </div>
  );
}
