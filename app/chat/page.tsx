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
  useToast,
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
  const toast = useToast();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_data')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('メッセージの取得中にエラーが発生しました:', error);
      toast({
        title: 'エラー',
        description: 'メッセージの取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
    } else {
      setMessages(data as ChatData[]);
      scrollToBottom();
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

  const updateUserStatus = useCallback(async (username: string, status: boolean) => {
    if (!username.trim()) {
      const { error: deleteError } = await supabase
        .from('user_status')
        .delete()
        .is('username', null);
      
      if (deleteError) {
        console.error('空のユーザー名のステータス削除中にエラーが発生しました:', deleteError);
      }
      return;
    }

    const { error: deleteError } = await supabase
      .from('user_status')
      .delete()
      .eq('username', username);
  
    if (deleteError) {
      console.error('古いステータスの削除中にエラーが発生しました:', deleteError);
    }
  
    const { error: insertError } = await supabase
      .from('user_status')
      .insert([{ username, is_online: status, updated_at: new Date().toISOString() }]);
    
    if (insertError) {
      console.error('新しいステータスの挿入中にエラーが発生しました:', insertError);
    }
  }, []);

  useEffect(() => {
    if (username) {
      updateUserStatus(username, true);

      // ページを閉じる際のイベントリスナーを追加
      const handleBeforeUnload = () => {
        updateUserStatus(username, false);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // コンポーネントのクリーンアップ時にイベントリスナーを削除
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateUserStatus(username, false);
      };
    }
  }, [username, updateUserStatus]);

  const getUserStatus = async (username: string) => {
    const { data } = await supabase
      .from('user_status')
      .select('is_online')
      .eq('username', username)
      .single();
    return data?.is_online ? 'オンライン' : 'オフライン';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'パスワードを入力してください';
    if (/[ぁ-ん]/.test(password)) return 'パスワードにひらがなを使用しないでください';
    return null;
  };

  const onSubmit = handleSubmit(async (data) => {
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      toast({
        title: 'エラー',
        description: passwordError,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
      return;
    }

    if (isSignup) {
      if (!data.username) {
        toast({
          title: 'エラー',
          description: 'ユーザー名を入力してください',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
        return;
      }
      if (!data.confirm) {
        toast({
          title: 'エラー',
          description: '確認用パスワードを入力してください',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
        return;
      }

      const confirmError = validatePassword(data.confirm);
      if (confirmError) {
        toast({
          title: 'エラー',
          description: confirmError,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
        return;
      }

      if (data.password !== data.confirm) {
        toast({
          title: 'エラー',
          description: 'パスワードが一致しません',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert([{ username: data.username, password: data.password, avatar_url: DEFAULT_AVATAR }]);

      if (error) {
        toast({
          title: 'エラー',
          description: 'ユーザー登録に失敗しました: ' + error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
      } else {
        toast({
          title: '成功',
          description: 'ユーザー登録が成功しました！',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
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
        toast({
          title: 'エラー',
          description: 'ユーザー名が見つかりません',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
        return;
      }

      if (userData.password !== data.password) {
        toast({
          title: 'エラー',
          description: 'パスワードが違います',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          containerStyle: {
            zIndex: 1500,
          },
        });
        return;
      }

      toast({
        title: '成功',
        description: 'ログイン成功！',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        }});
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
      broadcastTyping(false);
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
      toast({
        title: 'エラー',
        description: 'メッセージの送信に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setNewMessage('');
      broadcastTyping(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const deleteOldAvatar = async (oldAvatarUrl: string) => {
    if (!oldAvatarUrl || oldAvatarUrl === DEFAULT_AVATAR) return;
  
    const oldFileName = oldAvatarUrl.split('/').pop();
    if (!oldFileName) return;
  
    const { error } = await supabase.storage
      .from('avatars')
      .remove([`avatars/${oldFileName}`]);
  
    if (error) {
      console.error('古いアバターの削除中にエラーが発生しました:', error);
      toast({
        title: 'エラー',
        description: '古いアバターの削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
    }
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return;
  
    // 古いアバターを削除
    await deleteOldAvatar(avatarUrl);
  
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${username}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
  
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, selectedFile);
  
    if (uploadError) {
      console.error('画像のアップロード中にエラーが発生しました:', uploadError);
      toast({
        title: 'エラー',
        description: '画像のアップロードに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
      return;
    }
  
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  
    if (data) {
      await updateAvatarUrl(data.publicUrl);
    }
  };

  const updateAvatarUrl = async (newUrl: string) => {
    const oldUrl = avatarUrl;
  
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: newUrl })
      .eq('username', username);
  
    if (error) {
      console.error('アバターURLの更新中にエラーが発生しました:', error);
      toast({
        title: 'エラー',
        description: 'アバターURLの更新に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
      return;
    }
  
    const { error: messageError } = await supabase
      .from('chat_data')
      .update({ avatar_url: newUrl })
      .eq('username', username);
  
    if (messageError) {
      console.error('メッセージのアバターURL更新中にエラーが発生しました:', messageError);
      toast({
        title: 'エラー',
        description: 'メッセージのアバターURL更新に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
      return;
    }
  
    setAvatarUrl(newUrl);
    setIsSettingsOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fetchMessages();
    toast({
      title: '成功',
      description: 'アバター画像が更新されました',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
      containerStyle: {
        zIndex: 1500,
      },
    });
  
    // 古いアバターを削除（デフォルトアバター以外の場合）
    if (oldUrl !== DEFAULT_AVATAR) {
      await deleteOldAvatar(oldUrl);
    }
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
          <button className="nav-link settings-button" onClick={() =>
            setIsSettingsOpen(true)}>
            <span>Settings</span>
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

  const renderSettingsModal = () => (
    <div className="settings-modal">
      <div className="settings-content bg-discord-dark text-discord-text">
        <h2 className="text-xl font-bold mb-4">アバター画像の変更</h2>
        <div className="mb-4">
          <label htmlFor="avatar-upload" className="block mb-2">画像を選択</label>
          <input
            id="avatar-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-discord-blue text-white px-4 py-2 rounded-lg hover:bg-discord-blue-hover w-full"
          >
            画像を選択
          </button>
        </div>
        {selectedFile && (
          <div className="mb-4">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected avatar"
              className="w-24 h-24 object-cover rounded-full mx-auto"
            />
          </div>
        )}
        <div className="flex justify-between">
          <button
            onClick={uploadAvatar}
            disabled={!selectedFile}
            className={`bg-discord-green text-white px-4 py-2 rounded-lg ${
              selectedFile ? 'hover:bg-discord-green-hover' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            アップロード
          </button>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="bg-discord-red text-white px-4 py-2 rounded-lg hover:bg-discord-red-hover"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('chat_data')
      .delete()
      .match({ id: messageId });

    if (error) {
      console.error('メッセージの削除中にエラーが発生しました:', error);
      toast({
        title: 'エラー',
        description: 'メッセージの削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
    } else {
      fetchMessages();
      toast({
        title: '成功',
        description: 'メッセージが削除されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
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
      toast({
        title: 'エラー',
        description: 'メッセージの編集に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
    } else {
      fetchMessages();
      cancelEditingMessage();
      toast({
        title: '成功',
        description: 'メッセージが編集されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
        containerStyle: {
          zIndex: 1500,
        },
      });
    }
  };

  const renderChat = () => (
    <div className="relative min-h-screen flex flex-col">
      <div className="background-image"></div>
      <div className="main-content flex-grow flex flex-col">
        {renderNavbar()}
        <div className="flex-grow flex overflow-hidden">
          <div className="flex-grow flex flex-col bg-discord-dark">
            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-discord-scrollbar">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3 mb-3 hover:bg-discord-hover p-2 rounded">
                  <img
                    src={message.avatar_url || DEFAULT_AVATAR}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full cursor-pointer"
                    onMouseEnter={async (e) => {
                      const status = await getUserStatus(message.username);
                      const tooltip = document.createElement('div');
                      tooltip.innerText = `${message.username}: ${status}`;
                      tooltip.className = 'status-tooltip';
                      tooltip.style.position = 'absolute';
                      tooltip.style.top = `${e.clientY + 10}px`;
                      tooltip.style.left = `${e.clientX + 10}px`;
                      document.body.appendChild(tooltip);
                      
                      const handleMouseLeave = () => {
                        tooltip.remove();
                        e.target.removeEventListener('mouseleave', handleMouseLeave);
                      };
                      
                      e.target.addEventListener('mouseleave', handleMouseLeave);
                    }}
                  />
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <div className="text-discord-text font-medium mr-2">
                        {message.username}
                      </div>
                      <div className="text-xs text-discord-timestamp">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    {editingMessageId === message.id ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="flex-grow p-2 bg-discord-input text-discord-text rounded resize-none"
                          rows={2}
                        />
                        <button
                          onClick={() => saveEditedMessage(message.id)}
                          className="bg-discord-blue text-white px-3 py-1 rounded hover:bg-discord-blue-hover"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEditingMessage}
                          className="bg-discord-red text-white px-3 py-1 rounded hover:bg-discord-red-hover"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="text-discord-text whitespace-pre-wrap">{message.content}</div>
                    )}
                    {username === message.username && (
                      <div className="text-xs space-x-2 mt-1">
                        <button
                          onClick={() => startEditingMessage(message.id, message.content)}
                          className="text-discord-blue hover:underline"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="text-discord-red hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.filter(user => user !== username).join(', ')}が入力中...
              </div>
            )}
            <div className="p-4 bg-discord-dark">
              <div className="chat-input-container">
                <textarea
                  className="chat-textarea"
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleTyping}
                  placeholder="メッセージを入力..."
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <button
                  onClick={handleSendMessage}
                  className="chat-button"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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