'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import Styles from './Button.module.css';
import CircleLoader from '@/components/common/Progress/CircleLoader';

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outlined'
    | 'icon'
    | 'action'
    | 'danger'
    | 'submit';

type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    shapeless?: boolean;
    loading?: boolean;
    label?: string;
    showIcon?: boolean;
    icon?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    'aria-label'?: string;
    className?: string;
}

export default function Button({
    variant = 'primary',
    size = 'medium',
    shapeless = false,
    loading = false,
    label,
    showIcon = false,
    icon,
    type = 'button',
    disabled = false,
    onClick,
    'aria-label': ariaLabel,
    className = '',
}: ButtonProps) {
    const IconComponent = (icon && icon in LucideIcons
        ? LucideIcons[icon as keyof typeof LucideIcons]
        : LucideIcons.ArrowUpRight) as React.ElementType;

    const buttonClassName = [
        Styles.button,
        Styles[variant],
        Styles[size],
        shapeless && Styles.shapeless,
        loading && Styles.loading,
        className
    ].filter(Boolean).join(' ');

    const buttonAriaLabel = ariaLabel || 
        (!label && showIcon ? `${icon || 'button'} button` : label);

    return (
        <button
        className={buttonClassName}
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
        aria-label={buttonAriaLabel}
        >
        {showIcon && (
            loading ? (
            <CircleLoader 
                size={size === 'small' ? 14 : size === 'large' ? 20 : 18} 
                color={variant === 'outlined' || variant === 'icon' ? 'var(--color-text)' : '#fff'} 
                backgroundColor="#888" 
                thickness={2} 
            />
            ) : (
            IconComponent && (
                <IconComponent 
                className={Styles.buttonIcon} 
                size={size === 'small' ? 16 : size === 'large' ? 28 : 24} 
                />
            )
            )
        )}
        {label && <span className={Styles.buttonLabel}>{label}</span>}
        </button>
    );
}