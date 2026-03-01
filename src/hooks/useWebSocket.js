import { useState, useEffect, useCallback } from 'react';
import { WS_BASE_URL } from '../config.js';

export const useWebSocket = (onMessage, options = {}) => {
    const {
        autoReconnect = true,
        reconnectInterval = 3000,
        tagsFilter = null,
        groupBy = null,
    } = options;

    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    // Формируем URL с параметрами
    const buildWsUrl = useCallback(() => {
        const url = new URL(WS_BASE_URL);
        const params = new URLSearchParams();

        if (tagsFilter && Object.keys(tagsFilter).length > 0) {
            params.append('tags_filter', JSON.stringify(tagsFilter));
        }

        if (groupBy && groupBy.length > 0) {
            params.append('group_by', JSON.stringify(groupBy));
        }

        return params.toString() ? `${url}?${params.toString()}` : url.toString();
    }, [tagsFilter, groupBy]);

    useEffect(() => {
        let websocket = null;
        let reconnectTimer = null;

        const connect = () => {
            try {
                const wsUrl = buildWsUrl();
                console.log('Connecting to WebSocket:', wsUrl);

                websocket = new WebSocket(wsUrl);

                websocket.onopen = () => {
                    console.log('WebSocket connected');
                    setConnected(true);
                    setError(null);
                    // Send ping to keep alive
                    setInterval(() => {
                        if (websocket.readyState === WebSocket.OPEN) {
                            websocket.send('ping');
                        }
                    }, 30000);
                };

                websocket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (onMessage) {
                            onMessage(data);
                        }
                    } catch (e) {
                        console.error('Error parsing WebSocket message:', e);
                    }
                };

                websocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Connection error');
                };

                websocket.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    setConnected(false);

                    if (autoReconnect && event.code !== 1000) {
                        console.log(`Reconnecting in ${reconnectInterval}ms...`);
                        reconnectTimer = setTimeout(() => {
                            connect();
                        }, reconnectInterval);
                    }
                };

                setWs(websocket);
            } catch (err) {
                console.error('Failed to create WebSocket:', err);
                setError(err.message);
            }
        };

        connect();

        return () => {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (websocket) {
                websocket.close(1000, 'Component unmounted');
            }
        };
    }, [onMessage, autoReconnect, reconnectInterval, buildWsUrl]);

    const sendMessage = useCallback((message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, [ws]);

    return { ws, connected, error, sendMessage };
};

export default useWebSocket;