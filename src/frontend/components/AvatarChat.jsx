import React, { useState, useEffect, useRef } from 'react';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../../shared/constants/colors';

const AvatarChat = ({ counselor, onSendMessage, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [avatarState, setAvatarState] = useState({
    expression: 'professional',
    gesture: 'listening',
    speaking: false,
    mood: 'neutral'
  });
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    initializeSession();
  }, [counselor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/avatars/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counselorId: counselor.id,
          clientId: 'test-client' // In production, get from auth
        })
      });

      const data = await response.json();
      setSessionId(data.sessionId);
      
      // Add welcome message
      addMessage({
        id: 'welcome',
        content: `Hello! I'm ${counselor.name}, your ${counselor.specialization} specialist. I'm here to support you today. How can I help you?`,
        sender: 'counselor',
        timestamp: new Date(),
        avatarState: {
          expression: 'friendly',
          gesture: 'greeting',
          speaking: true,
          mood: 'positive'
        }
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      content: inputMessage,
      sender: 'client',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`/api/avatars/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sender: 'client'
        })
      });

      const data = await response.json();
      
      // Update avatar state
      setAvatarState(data.avatarState);
      
      // Add counselor response
      addMessage({
        id: data.message.id,
        content: data.message.content,
        sender: 'counselor',
        timestamp: new Date(data.message.timestamp),
        metadata: data.message.metadata
      });

      // Play voice if available
      if (data.voice && !data.voice.fallback) {
        playVoice(data.voice.audio);
      }

      // Reset typing state
      setTimeout(() => {
        setIsTyping(false);
        setAvatarState(prev => ({
          ...prev,
          speaking: false,
          expression: 'professional',
          gesture: 'listening'
        }));
      }, data.voice?.duration * 1000 || 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const playVoice = (audioData) => {
    if (audioRef.current) {
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  const getAvatarExpression = () => {
    const expressions = {
      professional: '😊',
      friendly: '😊',
      concerned: '😟',
      worried: '😰',
      serious: '😐',
      surprised: '😲',
      listening: '🤔'
    };
    return expressions[avatarState.expression] || '😊';
  };

  const getAvatarGesture = () => {
    const gestures = {
      listening: '👂',
      greeting: '👋',
      encouraging: '👍',
      supportive: '🤝',
      calming: '🤲',
      reassuring: '💝',
      attentive: '👁️'
    };
    return gestures[avatarState.gesture] || '👂';
  };

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: SPACING.md
    },
    chatWindow: {
      width: '100%',
      maxWidth: '800px',
      height: '80vh',
      backgroundColor: COLORS.background.primary,
      borderRadius: BORDER_RADIUS.large,
      boxShadow: SHADOWS.xlarge,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: COLORS.primary.main,
      color: COLORS.primary.contrast,
      padding: SPACING.md,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopLeftRadius: BORDER_RADIUS.large,
      borderTopRightRadius: BORDER_RADIUS.large
    },
    counselorInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.sm
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: COLORS.accent.warm,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      position: 'relative'
    },
    counselorDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    counselorName: {
      fontWeight: 'bold',
      fontSize: '18px'
    },
    counselorTitle: {
      fontSize: '14px',
      opacity: 0.9
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: COLORS.primary.contrast,
      fontSize: '24px',
      cursor: 'pointer',
      padding: SPACING.xs
    },
    messagesContainer: {
      flex: 1,
      padding: SPACING.md,
      overflowY: 'auto',
      backgroundColor: COLORS.background.secondary
    },
    message: {
      marginBottom: SPACING.md,
      display: 'flex',
      flexDirection: 'column'
    },
    clientMessage: {
      alignSelf: 'flex-end',
      backgroundColor: COLORS.primary.main,
      color: COLORS.primary.contrast,
      padding: SPACING.sm,
      borderRadius: BORDER_RADIUS.medium,
      maxWidth: '70%',
      wordWrap: 'break-word'
    },
    counselorMessage: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.background.primary,
      color: COLORS.text.primary,
      padding: SPACING.sm,
      borderRadius: BORDER_RADIUS.medium,
      maxWidth: '70%',
      wordWrap: 'break-word',
      boxShadow: SHADOWS.small
    },
    messageTime: {
      fontSize: '12px',
      color: COLORS.text.secondary,
      marginTop: SPACING.xs,
      alignSelf: 'flex-end'
    },
    inputContainer: {
      padding: SPACING.md,
      backgroundColor: COLORS.background.primary,
      borderTop: `1px solid ${COLORS.neutral[200]}`,
      display: 'flex',
      gap: SPACING.sm
    },
    input: {
      flex: 1,
      padding: SPACING.sm,
      border: `1px solid ${COLORS.neutral[300]}`,
      borderRadius: BORDER_RADIUS.medium,
      fontSize: '16px',
      outline: 'none',
      '&:focus': {
        borderColor: COLORS.primary.main
      }
    },
    sendButton: {
      padding: `${SPACING.sm} ${SPACING.md}`,
      backgroundColor: COLORS.primary.main,
      color: COLORS.primary.contrast,
      border: 'none',
      borderRadius: BORDER_RADIUS.medium,
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: COLORS.primary.dark
      },
      '&:disabled': {
        backgroundColor: COLORS.neutral[400],
        cursor: 'not-allowed'
      }
    },
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.xs,
      padding: SPACING.sm,
      color: COLORS.text.secondary,
      fontSize: '14px'
    },
    avatarStatus: {
      position: 'absolute',
      bottom: '-5px',
      right: '-5px',
      width: '20px',
      height: '20px',
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: avatarState.speaking ? COLORS.semantic.success : COLORS.neutral[400],
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.container} onClick={onClose}>
      <div style={styles.chatWindow} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.counselorInfo}>
            <div style={styles.avatar}>
              {getAvatarExpression()}
              <div style={styles.avatarStatus}>
                {avatarState.speaking ? '🔊' : '💬'}
              </div>
            </div>
            <div style={styles.counselorDetails}>
              <div style={styles.counselorName}>{counselor.name}</div>
              <div style={styles.counselorTitle}>{counselor.title}</div>
            </div>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((message) => (
            <div key={message.id} style={styles.message}>
              <div style={message.sender === 'client' ? styles.clientMessage : styles.counselorMessage}>
                {message.content}
              </div>
              <div style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={styles.typingIndicator}>
              <span>{getAvatarExpression()}</span>
              <span>{counselor.name} is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            style={styles.input}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={styles.sendButton}
          >
            Send
          </button>
        </div>

        {/* Hidden audio element for voice playback */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default AvatarChat; 