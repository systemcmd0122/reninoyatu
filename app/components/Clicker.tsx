import React, { useEffect, useState, useCallback } from 'react';
import { db, doc, updateDoc, onSnapshot } from '../firebaseConfig';
import styles from './Clicker.module.css';
import Loading from './Loading'

interface CountDocument {
  count: number;
}

const Clicker: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClicked, setIsClicked] = useState<boolean>(false);

  const countRef = doc(db, 'count', 'Mxhrra483w0h3QlUx8ek');

  useEffect(() => {
    const unsubscribe = onSnapshot(countRef, 
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
    if (isClicked) return;
    setIsClicked(true);
    try {
      await updateDoc(countRef, {
        count: count + 1
      });
    } catch (error) {
      console.error('Error updating document:', error);
      setError(`Failed to update data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setTimeout(() => setIsClicked(false), 300); // Reset click state after 300ms
    }
  }, [count, isClicked]);

  const clearError = () => setError(null);

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Current Count: {count}</h1>
      <div className={styles.buttonWrapper}>
        <button 
          onClick={handleIncrement} 
          className={`${styles.button} ${isClicked ? styles.clicked : ''}`}
          disabled={isLoading}
        >
          <img src="/icon.png" alt="Clicker" className={styles.icon} />
        </button>
      </div>
      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={clearError} className={styles.dismissButton}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default Clicker;
