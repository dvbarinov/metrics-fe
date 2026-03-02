import { useState, useEffect, useCallback, useRef } from 'react';
import { WS_BASE_URL } from '../config';

// 🔥 Глобальный инстанс WebSocket (один на всё приложение)
let globalWebSocket = null;
let reconnectTimer = null;
let connectionCount = 0;

export const useWebSocket = (onMessage, options = {}) => {
    const {
        autoReconnect = true,
        reconnectInterval = 3000, // Увеличили интервал
        maxReconnectAttempts = 10,
        tagsFilter = null,
        groupBy = null,
    } = options;

    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    // Рефы для отслеживания состояния (не вызывают ререндеры)
    const onMessageRef = useRef(onMessage);
    const reconnectAttemptsRef = useRef(0);
    const isCleaningUpRef = useRef(false);

    // Обновляем ref при изменении callback
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    // Формируем ключ подписки (для уникальности соединения)
    const connectionKey = JSON.stringify({ tagsFilter, groupBy });

    const connect = useCallback(() => {
        if (isCleaningUpRef.current) return;
        if (globalWebSocket?.readyState === WebSocket.OPEN) return;

        // Закрываем старое соединение перед созданием нового
        if (globalWebSocket) {
            console.log('🔒 Closing existing WebSocket before reconnect');
            globalWebSocket.close(1000, 'Reconnecting');
            globalWebSocket = null;
        }

        const wsUrl = buildWsUrl(tagsFilter, groupBy);
        console.log(`🔌 Connecting (${connectionCount + 1})...`, wsUrl);

        try {
            globalWebSocket = new WebSocket(wsUrl);

            globalWebSocket.onopen = () => {
                console.log('✅ WebSocket Connected');
                setConnected(true);
                setError(null);
                reconnectAttemptsRef.current = 0;
                connectionCount++;
            };

            globalWebSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (onMessageRef.current) {
                        onMessageRef.current(data);
                    }
                } catch (e) {
                    console.error('❌ Parse error:', e);
                }
            };

            globalWebSocket.onerror = (err) => {
                console.warn('⚠️ WebSocket Error (will retry)');
                setError('Connection error');
            };

            globalWebSocket.onclose = (event) => {
                console.log(`⚠️ WebSocket Closed: ${event.code}`);
                setConnected(false);

                if (isCleaningUpRef.current) return;

                // 🔥 Экспоненциальная задержка + лимит попыток
                if (autoReconnect &&
                    event.code !== 1000 &&
                    reconnectAttemptsRef.current < maxReconnectAttempts) {

                    reconnectAttemptsRef.current++;
                    const delay = Math.min(reconnectInterval * reconnectAttemptsRef.current, 30000);

                    console.log(`🔄 Reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);

                    if (reconnectTimer) clearTimeout(reconnectTimer);
                    reconnectTimer = setTimeout(connect, delay);
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    console.error('❌ Max reconnect attempts reached');
                    setError('Max reconnect attempts reached');
                }
            };

        } catch (err) {
            console.error('💥 WebSocket creation failed:', err);
            setError(err.message);
        }
    }, [autoReconnect, reconnectInterval, maxReconnectAttempts, connectionKey]);

    // 🔥 Инициализация подключения
    useEffect(() => {
        isCleaningUpRef.current = false;
        connect();

        // 🔥 Очистка при размонтировании
        return () => {
            console.log('🧹 Cleaning up WebSocket hook');
            isCleaningUpRef.current = true;

            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }

            // Не закрываем глобальное соединение, если другие компоненты его используют
            // Закрываем только если это последний компонент
            // (в простом случае можно закрывать всегда)
        };
    }, [connect]);

    // 🔥 Полная очистка при размонтировании приложения
    useEffect(() => {
        return () => {
            if (globalWebSocket) {
                globalWebSocket.close(1000, 'App unmounted');
                globalWebSocket = null;
            }
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        };
    }, []);

    const sendMessage = useCallback((message) => {
        if (globalWebSocket?.readyState === WebSocket.OPEN) {
            globalWebSocket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    return {
        ws: globalWebSocket,
        connected,
        error,
        sendMessage,
        connectionCount
    };
};

// 🔥 Вспомогательная функция для построения URL
const buildWsUrl = (tagsFilter, groupBy) => {
    const url = new URL(WS_BASE_URL);
    const params = new URLSearchParams();

    if (tagsFilter && Object.keys(tagsFilter).length > 0) {
        params.append('tags_filter', JSON.stringify(tagsFilter));
    }
    if (groupBy && groupBy.length > 0) {
        params.append('group_by', JSON.stringify(groupBy));
    }

    return params.toString() ? `${url}?${params.toString()}` : url.toString();
};

export default useWebSocket;