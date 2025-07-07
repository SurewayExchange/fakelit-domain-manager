import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute, FaSmile, FaRegSmile } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { BsEmojiSmile, BsEmojiFrown, BsEmojiNeutral } from 'react-icons/bs';

const EnhancedAvatarChat = ({ counselor, onClose, onSessionEnd }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState('neutral');
  const [avatarGesture, setAvatarGesture] = useState('idle');
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messageCount: 0,
    moodScore: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [motivationalMessage, setMotivationalMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const sessionStartTime = useRef(Date.now());

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRefognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      setSessionStats(prev => ({ ...prev, duration }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle sending message
  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      emotion: await analyzeEmotion(message)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Update avatar expression based on user emotion
    updateAvatarExpression(userMessage.emotion);

    try {
      const response = await sendMessageToAPI(message, userMessage.emotion);
      
      const counselorMessage = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'counselor',
        timestamp: new Date(),
        emotion: response.emotion,
        expression: response.expression,
        gesture: response.gesture,
        audioUrl: response.audioUrl
      };

      setMessages(prev => [...prev, counselorMessage]);
      
      // Play audio if available
      if (response.audioUrl) {
        playAudio(response.audioUrl);
      }

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1
      }));

      // Check for achievements
      if (response.achievements) {
        setAchievements(prev => [...prev, ...response.achievements]);
      }

      // Show motivational message
      if (response.motivationalMessage) {
        setMotivationalMessage(response.motivationalMessage);
        setTimeout(() => setMotivationalMessage(null), 5000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'counselor',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Send message to API
  const sendMessageToAPI = async (message, emotion) => {
    const response = await fetch('/api/chat/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        message,
        counselorId: counselor.id,
        emotion,
        sessionStats
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  };

  // Analyze emotion from text
  const analyzeEmotion = async (text) => {
    // Simple emotion analysis - in a real app, this would use a more sophisticated model
    const positiveWords = ['happy', 'good', 'great', 'excited', 'love', 'joy', 'wonderful'];
    const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'angry', 'depressed', 'anxious'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'joy';
    if (negativeCount > positiveCount) return 'sadness';
    return 'neutral';
  };

  // Update avatar expression
  const updateAvatarExpression = (emotion) => {
    const expressionMap = {
      'joy': 'happy',
      'sadness': 'sad',
      'anger': 'concerned',
      'fear': 'worried',
      'surprise': 'surprised',
      'neutral': 'neutral'
    };

    setAvatarExpression(expressionMap[emotion] || 'neutral');
  };

  // Play audio
  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsSpeaking(true);
      
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Toggle voice output
  const toggleVoiceOutput = () => {
    if (audioRef.current) {
      if (isSpeaking) {
        audioRef.current.pause();
        setIsSpeaking(false);
      } else {
        audioRef.current.play();
        setIsSpeaking(true);
      }
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get expression icon
  const getExpressionIcon = (expression) => {
    switch (expression) {
      case 'happy': return <BsEmojiSmile className="text-yellow-500" />;
      case 'sad': return <BsEmojiFrown className="text-blue-500" />;
      default: return <BsEmojiNeutral className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={counselor.avatar}
                alt={counselor.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                {getExpressionIcon(avatarExpression)}
              </motion.div>
            </div>
            <div>
              <h3 className="font-semibold">{counselor.name}</h3>
              <p className="text-sm opacity-90">{counselor.specialization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div>Session: {formatTime(sessionStats.duration)}</div>
              <div>Messages: {sessionStats.messageCount}</div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Avatar Display */}
        <div className="flex-1 bg-gray-50 p-4 relative overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{
                scale: isTyping ? [1, 1.05, 1] : 1,
                rotateY: avatarGesture === 'nodding' ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
              className="relative"
            >
              <img
                src={counselor.avatar}
                alt={counselor.name}
                className="w-64 h-64 rounded-full shadow-lg"
                style={{
                  filter: `brightness(${avatarExpression === 'happy' ? 1.1 : 1}) 
                           contrast(${avatarExpression === 'sad' ? 0.9 : 1})`
                }}
              />
              
              {/* Expression overlay */}
              <AnimatePresence>
                {avatarExpression !== 'neutral' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-6xl">
                      {getExpressionIcon(avatarExpression)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  } ${message.isError ? 'bg-red-500 text-white' : ''}`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
            </div>
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IoMdSend />
            </button>
            
            <button
              onClick={toggleVoiceOutput}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
        </div>

        {/* Audio element */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* Achievement notifications */}
        <AnimatePresence>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8, x: 300 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 300 }}
              className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 p-4 rounded-lg shadow-lg max-w-sm"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="font-semibold">{achievement.name}</h4>
                  <p className="text-sm">{achievement.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Motivational message */}
        <AnimatePresence>
          {motivationalMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-md text-center"
            >
              <p className="text-sm">{motivationalMessage.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EnhancedAvatarChat; 