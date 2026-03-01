import React from 'react';
import styles from './StatsCard.module.css';
import { formatValue } from '../../utils/format';

const StatsCard = ({ title, value, change, metricName, subtitle }) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {change !== undefined && (
                    <span className={`${styles.change} ${isPositive ? styles.positive : isNegative ? styles.negative : ''}`}>
            {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(change).toFixed(2)}%
          </span>
                )}
            </div>

            <div className={styles.value}>
                {value !== undefined ? formatValue(value, metricName) : '-'}
            </div>

            {subtitle && (
                <div className={styles.subtitle}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};

export default StatsCard;