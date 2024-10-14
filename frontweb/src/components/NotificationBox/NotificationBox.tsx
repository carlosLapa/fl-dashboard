import React from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';

const NotificationBox: React.FC = () => {
  const { isConnected, messages, sendMessage } = useWebSocket(
    'ws://localhost:8080/ws'
  );

  return (
    <div>
      <h2>Notifications</h2>
      <p>============================ Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{JSON.stringify(message)}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          sendMessage({ type: 'TEST', content: 'Hello, WebSocket!' })
        }
      >
        Send Test Message
      </button>
    </div>
  );
};

export default NotificationBox;
