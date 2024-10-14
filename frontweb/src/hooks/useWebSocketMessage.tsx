import { useState, useEffect, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  content: any;
}

const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const retryInterval = 3000;

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      console.log(`Attempting to connect to WebSocket (Attempt ${retryCount + 1})`);
      const token = localStorage.getItem('access_token');
      const ws = new WebSocket(`${url}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        if (token) {
          ws.send(JSON.stringify({ type: 'AUTHENTICATE', token }));
        }
        setIsConnected(true);
        setRetryCount(0);
      };

      ws.onmessage = (messageEvent: MessageEvent) => {
        console.log('Received WebSocket message:', messageEvent.data);
        const message = JSON.parse(messageEvent.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        if (retryCount < maxRetries) {
          reconnectTimeout = setTimeout(() => {
            setRetryCount(prevCount => prevCount + 1);
            connectWebSocket();
          }, retryInterval);
        } else {
          console.log('Max retries reached. Please refresh the page.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  // senão causa loop infinito!
  }, [url, retryCount]);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket, isConnected]
  );

  return { isConnected, messages, sendMessage };
};

export default useWebSocket;
