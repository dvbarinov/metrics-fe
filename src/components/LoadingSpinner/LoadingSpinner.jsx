import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', text = 'Загрузка...' }) => {
    const sizeClass = styles[size] || styles.medium;

    return (
        <div className={styles.container}>
            <div className={`${styles.spinner} ${sizeClass}`} />
            {text && <span className={styles.text}>{text}</span>}
        </div>
    );
};

export default LoadingSpinner;