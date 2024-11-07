import { useState, useEffect, useCallback } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  Notification as CustomNotification,
  NotificationInsertDTO,
} from 'types/notification';

interface WebSocketMessage {
  type: string;
  content: CustomNotification | NotificationInsertDTO;
}

interface ConnectionStats {
  messagesSent: number;
  messagesReceived: number;
  queueSize: number;
}

const useWebSocket = () => {
  const SOCKET_URL = 'http://localhost:8080/ws';
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<CustomNotification[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    messagesSent: 0,
    messagesReceived: 0,
    queueSize: 0,
  });

  const maxConnectionAttempts = 3;
  const MAX_MESSAGES = 50;

  const updateConnectionStats = useCallback(
    (type: 'sent' | 'received') => {
      setConnectionStats((prev) => ({
        ...prev,
        [`messages${type === 'sent' ? 'Sent' : 'Received'}`]:
          prev[`messages${type === 'sent' ? 'Sent' : 'Received'}`] + 1,
        queueSize: messages.length,
      }));
    },
    [messages.length]
  );

  const handleMessage = useCallback(
    (message: Message) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message.body);
        console.log('Received message:', parsedMessage);
        updateConnectionStats('received');

        if (parsedMessage.type === 'NOTIFICATION') {
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            if (newMessages.length > MAX_MESSAGES) {
              newMessages.splice(0, newMessages.length - MAX_MESSAGES);
            }
            return [
              ...newMessages,
              parsedMessage.content as CustomNotification,
            ];
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    },
    [updateConnectionStats]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConnectionError(null);
  }, []);

  const reconnect = useCallback(() => {
    if (connectionAttempts < maxConnectionAttempts) {
      setConnectionAttempts((prev) => prev + 1);
      if (stompClient) {
        stompClient.deactivate();
        setTimeout(() => {
          stompClient.activate();
        }, 1000);
      }
    } else {
      setConnectionError('Max reconnection attempts reached');
    }
  }, [stompClient, connectionAttempts]);

  const addSubscription = useCallback(
    (topic: string) => {
      if (stompClient && isConnected && !subscriptions.includes(topic)) {
        stompClient.subscribe(topic, handleMessage);
        setSubscriptions((prev) => [...prev, topic]);
      }
    },
    [stompClient, isConnected, subscriptions, handleMessage]
  );

  const removeSubscription = useCallback(
    (topic: string) => {
      if (stompClient && isConnected) {
        stompClient.unsubscribe(topic);
        setSubscriptions((prev) => prev.filter((t) => t !== topic));
      }
    },
    [stompClient, isConnected]
  );

  const filterMessages = useCallback(
    (type: string) => {
      return messages.filter((msg) => msg.type === type);
    },
    [messages]
  );

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (stompClient && isConnected) {
        console.log('Sending message:', message);
        stompClient.publish({
          destination: '/app/notifications',
          body: JSON.stringify(message),
        });
        updateConnectionStats('sent');
      } else {
        console.log('Cannot send message - connection not ready');
      }
    },
    [stompClient, isConnected, updateConnectionStats]
  );

  useEffect(() => {
    let isComponentMounted = true;
    const token = localStorage.getItem('access_token');

    if (!token) {
      setConnectionError('No authentication token found');
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      if (isComponentMounted) {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        setConnectionAttempts(0);
        client.subscribe('/topic/notifications', handleMessage);
      }
    };

    client.onStompError = (frame) => {
      if (isComponentMounted) {
        console.error('STOMP error:', frame);
        setIsConnected(false);
        setConnectionError(
          `Connection error: ${frame.headers?.message || 'Unknown error'}`
        );
      }
    };

    client.onWebSocketClose = () => {
      if (isComponentMounted) {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      }
    };

    console.log('Activating WebSocket connection...');
    client.activate();
    setStompClient(client);

    return () => {
      isComponentMounted = false;
      if (client.connected) {
        console.log('Cleaning up WebSocket connection...');
        client.deactivate();
      }
    };
  }, [handleMessage]);

  return {
    isConnected,
    messages,
    sendMessage,
    connectionError,
    clearMessages,
    reconnect,
    addSubscription,
    removeSubscription,
    filterMessages,
    connectionAttempts,
    connectionStats,
  };
};

export default useWebSocket;
