import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';


const socket = io(import.meta.env.VITE_BACKEND_URL);

function Chat() {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messageArray, setMessageArray] = useState([]);
  const [username] = useState(location.state?.username || 'Anonymous');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null); // store timeout

  const [typingUser, setTypingUser] = useState('');

  // 📨 Receive messages
  useEffect(() => {
    socket.on('message-recive', ({ message, username, time }) => {
      setMessageArray((prev) => [...prev, { message, username, time }]);
    });

    return () => {
      socket.off('message-recive');
    };
  }, []);

  // 🧭 Auto-scroll
  useLayoutEffect(() => {
    const chatBox = messagesEndRef.current;
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, [messageArray]);

  // 👀 Typing indicator listener
  useEffect(() => {
    socket.on('user-typing', ({ username, isTyping }) => {
      if (isTyping) {
        setTypingUser(username);
      } else {
        setTypingUser('');
      }
    });

    return () => {
      socket.off('user-typing');
    };
  }, []);

  // ✉️ Send message
  const sentMessage = () => {
    if (!message.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    socket.emit('message', { message, username, time });
    setMessage('');
    socket.emit('typing', { username, isTyping: false }); // stop typing after send
  };

  // ⌨️ Handle typing
  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    socket.emit('typing', { username, isTyping: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { username, isTyping: false });
    }, 1000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>{`Welcome Back ${username}`}</h1>
      <ul
        ref={messagesEndRef}
        style={{
          height: '300px',
          width: '500px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          listStyle: 'none',
        }}
      >
        {messageArray.map((v, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              justifyContent: v.username === username ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                backgroundColor: v.username === username ? '#DCF8C6' : '#FFF',
                padding: '8px 12px',
                borderRadius: '15px',
                maxWidth: '60%',
                wordWrap: 'break-word',
              }}
            >
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                {v.username === username ? 'You' : v.username}
              </p>
              <p style={{ margin: 0 }}>{v.message}</p>
              <p style={{ fontSize: '0.7em', textAlign: 'right', marginTop: '2px' }}>{v.time}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* 🟢 Typing Indicator */}
      <div style={{ minHeight: '20px', fontStyle: 'italic', fontSize: '0.8em' }}>
        {typingUser && `${typingUser} is typing...`}
      </div>

      {/* Input */}
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type your message..."
        />
        <button type="button" onClick={sentMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
