import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from './Loading.module.css';

const Loading = () => {
  useEffect(() => {
    // ローディング表示時にスクロールを無効にする
    document.body.style.overflow = 'hidden';

    // コンポーネントがアンマウントされたときにスクロールを有効に戻す
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.loader}>
      <Image src='/icon.png' alt="Loading" className={styles.spinner} width={100} height={100} />
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
