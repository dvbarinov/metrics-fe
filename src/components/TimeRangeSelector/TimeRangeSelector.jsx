import React from 'react';
import styles from './TimeRangeSelector.module.css';

const TimeRangeSelector = ({ selectedRange, onChange }) => {
    const ranges = [
        { value: 5, label: '5 минут' },
        { value: 15, label: '15 минут' },
        { value: 30, label: '30 минут' },
        { value: 60, label: '1 час' },
        { value: 180, label: '3 часа' },
        { value: 360, label: '6 часов' },
        { value: 1440, label: '24 часа' },
    ];

    return (
        <div className={styles.timeRangeSelector}>
            <label className={styles.label}>Период</label>
            <div className={styles.buttons}>
                {ranges.map((range) => (
                    <button
                        key={range.value}
                        className={`${styles.button} ${selectedRange === range.value ? styles.active : ''}`}
                        onClick={() => onChange(range.value)}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TimeRangeSelector;