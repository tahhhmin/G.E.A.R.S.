import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // progress should be between 0 and 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        style={{ width: `${clampedProgress}%` }}
      />
      <span className={styles.label}>{clampedProgress}%</span>
    </div>
  );
};

export default ProgressBar;
