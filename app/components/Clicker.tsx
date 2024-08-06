import React, { useEffect, useState, useCallback, useRef } from 'react';
import { db, doc, updateDoc, onSnapshot } from '../firebaseConfig';
import styles from './Clicker.module.css';
import Loading from './Loading';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface CountDocument {
  count: number;
}

const Clicker: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clickCount, setClickCount] = useState<number>(0);
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);
  const [celebration, setCelebration] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const countRef = doc(db, 'count', 'Mxhrra483w0h3QlUx8ek');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      countRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CountDocument;
          setCount(data.count);
        } else {
          console.log('No such document!');
          setError('Document does not exist');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching document:', error);
        setError(`Failed to fetch data: ${error.message}`);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleIncrement = useCallback(async () => {
    setClickCount((prev) => prev + 1);
    setConfettiPieces((prev) => [...prev, Date.now()]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      const newCount = count + 1;
      await updateDoc(countRef, {
        count: newCount,
      });

      if (newCount % 100 === 0) {
        setCelebration(true);
        timeoutRef.current = setTimeout(() => setCelebration(false), 5000); // 5秒間お祝いモードを継続
      }
    } catch (error) {
      console.error('Error updating document:', error);
      setError(`Failed to update data: ${error instanceof Error ? error.message : String(error)}`);
    }

    timeoutRef.current = setTimeout(() => {
      setClickCount(0);
      setConfettiPieces([]);
    }, 2000);
  }, [count]);

  const clearError = () => setError(null);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <motion.div className={styles.container}>
      {confettiPieces.map((id) => (
        <Confetti
          key={id}
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={50}
          gravity={0.2}
          confettiSource={{
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            w: 0,
            h: 0
          }}
        />
      ))}
      {celebration && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={1000}
          gravity={0.3}
        />
      )}
      <h1 className={styles.title}>{count}</h1>
      <div className={styles.buttonWrapper}>
        <motion.button
          onClick={handleIncrement}
          className={styles.button}
          disabled={isLoading}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img src="/icon.png" alt="Clicker" className={styles.icon} />
        </motion.button>
      </div>
      <AnimatePresence>
        {clickCount > 0 && (
          <motion.div
            className={styles.popup}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={clickCount}
          >
            +{clickCount}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {celebration && (
          <motion.div
            className={styles.celebration}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotateZ: [0, 10, -10, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            🎉 おめでとう{count}回目のクリックを達成しました! 🎉
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={clearError} className={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Clicker;
