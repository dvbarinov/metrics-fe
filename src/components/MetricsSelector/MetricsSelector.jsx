import React from 'react';
import styles from './MetricsSelector.module.css';

const MetricSelector = ({ selectedService, selectedMetric, onServiceChange, onMetricChange }) => {
    const services = ['api-gateway', 'auth-service', 'payment-service', 'user-service', 'notification-service'];
    const metrics = ['latency_ms', 'rps', 'error_rate', 'cpu_usage', 'memory_usage', 'response_time'];

    return (
        <div className={styles.metricSelector}>
            <div className={styles.selectGroup}>
                <label className={styles.label}>Сервис</label>
                <select
                    className={styles.select}
                    value={selectedService || ''}
                    onChange={(e) => onServiceChange(e.target.value)}
                >
                    <option value="">— Выберите сервис —</option>
                    {services.map((service) => (
                        <option key={service} value={service}>
                            {service}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.selectGroup}>
                <label className={styles.label}>Метрика</label>
                <select
                    className={styles.select}
                    value={selectedMetric || ''}
                    onChange={(e) => onMetricChange(e.target.value)}
                    disabled={!selectedService}
                >
                    <option value="">— Выберите метрику —</option>
                    {metrics.map((metric) => (
                        <option key={metric} value={metric}>
                            {formatMetricName(metric)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const formatMetricName = (name) => {
    const map = {
        'latency_ms': '⏱️ Задержка (ms)',
        'rps': '🚀 Запросов/сек',
        'error_rate': '❌ Процент ошибок',
        'cpu_usage': '💻 Использование CPU',
        'memory_usage': '🧠 Использование памяти',
        'response_time': '⏱️ Время ответа',
    };
    return map[name] || name;
};

export default MetricSelector;