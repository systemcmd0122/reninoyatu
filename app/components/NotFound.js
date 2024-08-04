// components/NotFound.js
import styles from './NotFound.module.css';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.errorCode}>404</div>
      <p className={styles.message}>Page Not Found</p>
    </div>
  );
};

export default NotFound;
