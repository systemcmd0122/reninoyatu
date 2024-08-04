// components/Error.js
import styles from './Error.module.css';
import Link from 'next/link';

const Error = ({ statusCode }) => {
  return (
    <div className={styles.container}>
      <div className={styles.errorCode}>{statusCode}</div>
      <p className={styles.message}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    </div>
  );
};

export default Error;
