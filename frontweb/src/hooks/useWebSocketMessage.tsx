import { useState, useEffect, useCallback } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  Notification as CustomNotification,
  NotificationInsertDTO,
  NotificationType,
} from 'types/notification';

interface WebSocketMessage {
  type: string;
  content: CustomNotification | NotificationInsertDTO | string;
}

interface ConnectionStats {
  messagesSent: number;
  messagesReceived: number;
  queueSize: number;
}

const useWebSocket = (userId: number) => {
  // Accept userId as a parameter
  const SOCKET_URL = 'http://localhost:8080/ws';
  const userSpecificTopic = `/topic/notifications/${userId}`;
  const projectSpecificTopic = `/topic/project-notifications/${userId}`;
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

  const handleConnect = useCallback(() => {
    console.log('WebSocket connected successfully');
    setIsConnected(true);
    setConnectionError(null);
    setConnectionAttempts(0);
  }, []);

  const handleError = useCallback((frame: any) => {
    console.error('STOMP error:', frame);
    setIsConnected(false);
    setConnectionError(
      `Connection error: ${frame.headers?.message || 'Unknown error'}`
    );
    reconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    console.log('WebSocket connection closed');
    setIsConnected(false);
    reconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        console.log('Raw message received:', message.body);
        const parsedMessage = JSON.parse(message.body);
        console.log('Parsed message:', parsedMessage);
        updateConnectionStats('received');

        // Handle both direct notification objects and wrapped messages
        const notification =
          parsedMessage.type === 'NOTIFICATION'
            ? parsedMessage.content
            : parsedMessage;

        if (
          notification.user?.id === userId &&
          Object.values(NotificationType).includes(notification.type)
        ) {
          setMessages((prevMessages) => {
            // Check for duplicates using the correct property structure
            const isDuplicate = prevMessages.some(
              (msg) =>
                msg.type === notification.type &&
                msg.relatedId === notification.relatedId &&
                msg.user?.id === notification.user?.id
            );

            if (isDuplicate) {
              console.log('Duplicate notification detected, skipping');
              return prevMessages;
            }

            const newMessages = [...prevMessages];
            if (newMessages.length > MAX_MESSAGES) {
              newMessages.splice(0, newMessages.length - MAX_MESSAGES);
            }
            return [...newMessages, notification as CustomNotification];
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    },
    [updateConnectionStats, userId]
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
      if (stompClient?.connected) {
        try {
          stompClient.unsubscribe(topic);
          setSubscriptions((prev) => prev.filter((t) => t !== topic));
        } catch (error) {
          console.log('Error unsubscribing:', error);
        }
      }
    },
    [stompClient]
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
          destination: '/app/send-notification', // Ensure this matches the @MessageMapping in the backend
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

    if (!token || userId === 0) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      if (isComponentMounted) {
        handleConnect();
        const subscriptions = [
          client.subscribe(userSpecificTopic, handleMessage),
          client.subscribe(projectSpecificTopic, handleMessage),
          client.subscribe('/user/queue/errors', handleError),
        ];
        setSubscriptions(subscriptions.map((sub) => sub.id));
      }
    };

    client.onStompError = handleError;
    client.onWebSocketClose = handleClose;

    console.log('Activating WebSocket connection...');
    client.activate();
    setStompClient(client);

    return () => {
      isComponentMounted = false;
      if (client.connected) {
        subscriptions.forEach((subId) => {
          try {
            client.unsubscribe(subId);
          } catch (error) {
            console.log('Cleanup unsubscribe error:', error);
          }
        });
        client.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, handleConnect, handleError, handleClose, handleMessage]);

  const getConnectionStatus = useCallback(() => {
    if (isConnected) return 'Connected';
    if (connectionError) return `Error: ${connectionError}`;
    if (connectionAttempts > 0)
      return `Reconnecting (${connectionAttempts}/${maxConnectionAttempts})`;
    return 'Disconnected';
  }, [isConnected, connectionError, connectionAttempts, maxConnectionAttempts]);

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
    getConnectionStatus,
  };
};

export default useWebSocket;
