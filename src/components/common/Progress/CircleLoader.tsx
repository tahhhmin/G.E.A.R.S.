import React from 'react';
import styles from './CircleLoader.module.css';

interface CircleLoaderProps {
    size?: number | string;       // Size in px or rem
    color?: string;               // Main color for the spinning arc
    thickness?: number;           // Border thickness in px
    backgroundColor?: string;     // Color for remaining 3 borders
    ariaLabel?: string;           // For screen readers
}

const CircleLoader: React.FC<CircleLoaderProps> = ({
    size = 40,
    color = 'var(--color-primary)',
    thickness = 4,
    backgroundColor = 'transparent',
    ariaLabel = 'Loading',
    }) => {
    const sizeValue = typeof size === 'number' ? `${size}px` : size;

    return (
        <div
        className={styles.loader}
        role="status"
        aria-label={ariaLabel}
        style={{
            width: sizeValue,
            height: sizeValue,
            borderWidth: thickness,
            borderTopColor: color,
            borderRightColor: backgroundColor,
            borderBottomColor: backgroundColor,
            borderLeftColor: backgroundColor,
        }}
        />
    );
};

export default CircleLoader;
