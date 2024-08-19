'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import './styles.css';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
} from '@/common/design';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

interface ChatData {
  id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { handleSubmit, register, reset } = useForm();
  const router = useRouter();

  // 新しい状態変数
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

//メッセージ削除
const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
const [editingContent, setEditingContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, []);

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const typingSubscription = supabase
      .channel('typing')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers((prevUsers) => {
          if (payload.isTyping) {
            if (!prevUsers.includes(payload.username)) {
              return [...prevUsers, payload.username];
            }
            return prevUsers;
          } else {
            return prevUsers.filter((user) => user !== payload.username);
          }
        });
      })
      .subscribe();
  
    return () => {
      typingSubscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string) => {
    if (!password) return 'パスワードを入力してください';
    if (/[ぁ-ん]/.test(password)) return 'パスワードにひらがなを使用しないでください';
    return null;
  };

  const onSubmit = handleSubmit(async (data) => {
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    if (isSignup) {
      if (!data.username) {
        alert('ユーザー名を入力してください');
        return;
      }
      if (!data.confirm) {
        alert('確認用パスワードを入力してください');
        return;
      }

      const confirmError = validatePassword(data.confirm);
      if (confirmError) {
        alert(confirmError);
        return;
      }

      if (data.password !== data.confirm) {
        alert('パスワードが一致しません');
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert([{ username: data.username, password: data.password, avatar_url: DEFAULT_AVATAR }]);

      if (error) {
        alert('エラーが発生しました: ' + error.message);
      } else {
        alert('ユーザー登録が成功しました！');
        setUsername(data.username);
        setAvatarUrl(DEFAULT_AVATAR);
        reset();
        router.push('/chat');
      }
    } else {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, password, avatar_url')
        .eq('username', data.username)
        .single();

      if (userError || !userData) {
        alert('ユーザー名が見つかりません');
        return;
      }

      if (userData.password !== data.password) {
        alert('パスワードが違います');
        return;
      }

      alert('ログイン成功！');
      setUsername(userData.username);
      setAvatarUrl(userData.avatar_url || DEFAULT_AVATAR);
      reset();
      router.push('/chat');
    }
  });

  const broadcastTyping = (isTyping: boolean) => {
    supabase.channel('typing').send({
      type: 'broadcast',
      event: 'typing',
      payload: { username, isTyping },
    });
  };

  const handleTyping = () => {
    if (!typingUsers.includes(username)) {
      broadcastTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (typingUsers.includes(username)) {
        broadcastTyping(false);
      }
    }, 3000);
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
          avatar_url: avatarUrl
        }
      ]);

    if (error) {
      console.error('メッセージの送信中にエラーが発生しました:', error);
    }

    setNewMessage('');
    broadcastTyping(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 新しい関数: アバターURL更新
  const updateAvatarUrl = async (newUrl: string) => {
    // ユーザーのアバターURLを更新
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: newUrl })
      .eq('username', username);

    if (error) {
      console.error('アバターURLの更新中にエラーが発生しました:', error);
      return;
    }

    // 全てのメッセージのアバターURLを更新
    const { error: messageError } = await supabase
      .from('chat_data')
      .update({ avatar_url: newUrl })
      .eq('username', username);

    if (messageError) {
      console.error('メッセージのアバターURL更新中にエラーが発生しました:', messageError);
      return;
    }

    setAvatarUrl(newUrl);
    setIsSettingsOpen(false);
    setNewAvatarUrl('');
    fetchMessages(); // メッセージを再取得して UI を更新
  };

  const renderNavbar = () => (
    <nav className="navbar text-white flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img src="/icon.png" alt="Icon" className="h-8 w-8" />
        <div className="text-lg font-bold minecraft-font rainbow-border">例のやつ：Chat</div>
      </div>
      <div className="flex space-x-4 minecraft-font">
        <Link href="/" className="nav-link"><span>Home</span></Link>
        <Link href="/about" className="nav-link"><span>About</span></Link>
        <Link href="/contact" className="nav-link"><span>Contact</span></Link>
        <Link href="/enjoy" className="nav-link"><span>Enjoy</span></Link>
        {username ? (
          <button className="nav-link settings-button" onClick={() => setIsSettingsOpen(true)}>
            <span>設定</span>
          </button>
        ) : (
          <Link href="/chat" className="nav-link"><span>Chat</span></Link>
        )}
      </div>
    </nav>
  );


  const renderAuth = () => (
    <div className="relative min-h-screen flex flex-col">
      <div className="background-image"></div>
      <div className="main-content flex-grow flex flex-col">
        {renderNavbar()}
        <Flex
          flexDirection='column'
          width='100%'
          height='calc(100vh - 64px)'
          justifyContent='center'
          alignItems='center'
        >
          <VStack spacing='5'>
            <Heading>{isSignup ? '新規登録' : 'ログイン'}</Heading>
            <form onSubmit={onSubmit}>
              <VStack spacing='4' alignItems='left'>
                <FormControl>
                  <FormLabel htmlFor='username' textAlign='start'>
                    ユーザーネーム
                  </FormLabel>
                  <Input id='username' {...register('username')} bg='white' />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='password'>パスワード</FormLabel>
                  <InputGroup size='md'>
                    <Input
                      pr='4.5rem'
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      bg='white'
                    />
                    <InputRightElement width='4.5rem'>
                      <Button h='1.75rem' size='sm' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                {isSignup && (
                  <FormControl>
                    <FormLabel htmlFor='confirm'>パスワード確認</FormLabel>
                    <InputGroup size='md'>
                      <Input
                        pr='4.5rem'
                        type={showConfirm ? 'text' : 'password'}
                        {...register('confirm')}
                        bg='white'
                      />
                      <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                )}
                <Button
                  marginTop='4'
                  color='white'
                  bg='teal.400'
                  type='submit'
                  paddingX='auto'
                >
                  {isSignup ? '新規登録' : 'ログイン'}
                </Button>
              </VStack>
            </form>
            <Button
              bg='white'
              color='black'
              onClick={() => setIsSignup(!isSignup)}
              width='100%'
            >
              {isSignup ? 'ログインはこちらから' : '新規登録はこちらから'}
            </Button>
          </VStack>
        </Flex>
      </div>
    </div>
  );

  // 新しい関数: 設定モーダルのレンダリング
  const renderSettingsModal = () => (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>アバターURLの変更</h2>
        <input
          type="text"
          value={newAvatarUrl}
          onChange={(e) => setNewAvatarUrl(e.target.value)}
          placeholder="新しいアバターURLを入力"
        />
        <button onClick={() => updateAvatarUrl(newAvatarUrl)}>更新</button>
        <button onClick={() => setIsSettingsOpen(false)}>キャンセル</button>
      </div>
    </div>
  );

  //メッセージ変更
  const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('chat_data')
    .delete()
    .match({ id: messageId });

  if (error) {
    console.error('メッセージの削除中にエラーが発生しました:', error);
  } else {
    fetchMessages();
  }
};

const startEditingMessage = (messageId: string, content: string) => {
  setEditingMessageId(messageId);
  setEditingContent(content);
};

const cancelEditingMessage = () => {
  setEditingMessageId(null);
  setEditingContent('');
};

const saveEditedMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('chat_data')
    .update({ content: editingContent })
    .match({ id: messageId });

  if (error) {
    console.error('メッセージの編集中にエラーが発生しました:', error);
  } else {
    fetchMessages();
    cancelEditingMessage();
  }
};

  const renderChat = () => (
    <div className="relative min-h-screen flex flex-col">
      <div className="background-image"></div>
      {renderNavbar()}
      <div className="main-content flex-grow flex flex-col">
        <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.username === username ? 'own-message' : ''}`}>
              <img src={msg.avatar_url || DEFAULT_AVATAR} alt="Avatar" className="chat-avatar" />
              <div className="chat-message-content">
                <span className="chat-message-username">{msg.username}</span>
                {editingMessageId === msg.id ? (
                  <div>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="edit-message-textarea"
                    />
                    <button onClick={() => saveEditedMessage(msg.id)}>保存|</button>
                    <button onClick={cancelEditingMessage}>   キャンセル</button>
                  </div>
                ) : (
                  <div>{msg.content}</div>
                )}
                {msg.username === username && (
                  <div className="message-actions">
                    <button onClick={() => startEditingMessage(msg.id, msg.content)}>編集</button>
                    <button onClick={() => deleteMessage(msg.id)}>削除</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
          <div className="typing-indicator">
            {typingUsers.filter(user => user !== username).length > 0 && (
              <Text fontSize="sm" color="white">
                {typingUsers.filter(user => user !== username).join(', ')}
                {typingUsers.filter(user => user !== username).length > 1 ? ' が入力中...' : ' が入力中...'}
              </Text>
            )}
          </div>
          <div className="chat-input-container">
            <textarea
              className="chat-textarea"
              placeholder="メッセージを入力..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-button" onClick={handleSendMessage}>
              送信
            </button>
          </div>
        </div>
      </div>
      {/* 設定モーダルを表示 */}
      {isSettingsOpen && renderSettingsModal()}
    </div>
  );

  return (
    <div>
      {username ? renderChat() : renderAuth()}
    </div>
  );
};

export default Chat;