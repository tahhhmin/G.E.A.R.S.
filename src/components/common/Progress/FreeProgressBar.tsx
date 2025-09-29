import React from 'react';
import styles from './FreeProgressBar.module.css';

interface IndeterminateProgressBarProps {
  className?: string;
  height?: number;
  color?: string;
  speed?: number;
}

const IndeterminateProgressBar: React.FC<IndeterminateProgressBarProps> = ({ 
    className,
    height = 16,
    color = 'var(--color-primary)',
    speed = 2
}) => {
  return (
    <div 
      className={`${styles.progressContainer} ${className || ''}`}
      style={{ height: `${height}px` }}
    >
      <div 
        className={styles.indeterminateBar}
        style={{ 
          height: `${height}px`,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animationDuration: `${speed}s`
        }}
      />
    </div>
  );
};

export default IndeterminateProgressBar;