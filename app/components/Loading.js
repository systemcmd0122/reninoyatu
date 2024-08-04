// components/Loading.js
import Image from "next/image";
import styles from './Loading.module.css';

const Loading = () => {
  return (
    <div className={styles.loader}>
      <img src='/icon.png' alt="Loading" className={styles.spinner} />
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
