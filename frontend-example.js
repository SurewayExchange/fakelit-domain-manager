// Frontend Integration Examples for CareConnect AI Chatbot
// This file shows how to integrate the API with different frontend frameworks

// ============================================================================
// REACT NATIVE EXAMPLE
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const CareConnectChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [selectedService, setSelectedService] = useState('mental-health');

  const API_BASE_URL = 'http://localhost:3000/api';

  useEffect(() => {
    // Generate session ID on component mount
    setSessionId(`mobile-session-${Date.now()}`);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/${selectedService}`,
        {
          message: inputText,
          language: 'en',
          anonymous: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId
          }
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        crisisLevel: response.data.crisisLevel,
        resources: response.data.resources
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show crisis alert if needed
      if (response.data.requiresEscalation) {
        Alert.alert(
          'Crisis Detected',
          'We\'re concerned about what you\'ve shared. Would you like to speak with a human counselor?',
          [
            { text: 'No, thanks', style: 'cancel' },
            { text: 'Yes, connect me', onPress: () => connectToCounselor() }
          ]
        );
      }

    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const connectToCounselor = () => {
    // Implementation for connecting to human counselor
    Alert.alert('Connecting...', 'We\'re connecting you with a human counselor now.');
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      {item.resources && item.resources.length > 0 && (
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>Suggested Resources:</Text>
          {item.resources.map((resource, index) => (
            <Text key={index} style={styles.resourceItem}>• {resource}</Text>
          ))}
        </View>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Service Type Selector */}
      <View style={styles.serviceSelector}>
        <Text style={styles.serviceTitle}>Select Service:</Text>
        <View style={styles.serviceButtons}>
          {['mental-health', 'drug-alcohol', 'social-family', 'career-school'].map(service => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceButton,
                selectedService === service && styles.selectedService
              ]}
              onPress={() => setSelectedService(service)}
            >
              <Text style={styles.serviceButtonText}>
                {service.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.messagesList}
        inverted={false}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  serviceSelector: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  selectedService: {
    backgroundColor: '#007AFF',
  },
  serviceButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  resourcesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resourceItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// ============================================================================
// FLUTTER EXAMPLE (Dart)
// ============================================================================

/*
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CareConnectChat extends StatefulWidget {
  @override
  _CareConnectChatState createState() => _CareConnectChatState();
}

class _CareConnectChatState extends State<CareConnectChat> {
  final TextEditingController _controller = TextEditingController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String _sessionId = 'flutter-session-${DateTime.now().millisecondsSinceEpoch}';
  String _selectedService = 'mental-health';

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      text: _controller.text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMessage);
      _isLoading = true;
    });

    _controller.clear();

    try {
      final response = await http.post(
        Uri.parse('http://localhost:3000/api/chat/$_selectedService'),
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': _sessionId,
        },
        body: json.encode({
          'message': userMessage.text,
          'language': 'en',
          'anonymous': false,
        }),
      );

      final data = json.decode(response.body);
      
      final aiMessage = ChatMessage(
        text: data['response'],
        isUser: false,
        timestamp: DateTime.now(),
        crisisLevel: data['crisisLevel'],
        resources: List<String>.from(data['resources'] ?? []),
      );

      setState(() {
        _messages.add(aiMessage);
        _isLoading = false;
      });

      // Show crisis alert if needed
      if (data['requiresEscalation'] == true) {
        _showCrisisAlert();
      }

    } catch (error) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send message: $error')),
      );
    }
  }

  void _showCrisisAlert() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Crisis Detected'),
        content: Text('We\'re concerned about what you\'ve shared. Would you like to speak with a human counselor?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('No, thanks'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _connectToCounselor();
            },
            child: Text('Yes, connect me'),
          ),
        ],
      ),
    );
  }

  void _connectToCounselor() {
    // Implementation for connecting to human counselor
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Connecting you with a human counselor...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CareConnect AI Chat'),
        backgroundColor: Colors.blue,
      ),
      body: Column(
        children: [
          // Service selector
          Container(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Select Service:',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    'mental-health',
                    'drug-alcohol',
                    'social-family',
                    'career-school',
                  ].map((service) => ChoiceChip(
                    label: Text(service.replaceAll('-', ' ').toUpperCase()),
                    selected: _selectedService == service,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedService = service;
                        });
                      }
                    },
                  )).toList(),
                ),
              ],
            ),
          ),
          
          // Messages
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageWidget(message);
              },
            ),
          ),
          
          // Input
          Container(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Type your message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    maxLines: null,
                  ),
                ),
                SizedBox(width: 8),
                _isLoading
                    ? CircularProgressIndicator()
                    : IconButton(
                        icon: Icon(Icons.send),
                        onPressed: _sendMessage,
                        color: Colors.blue,
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageWidget(ChatMessage message) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: message.isUser 
            ? MainAxisAlignment.end 
            : MainAxisAlignment.start,
        children: [
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: message.isUser ? Colors.blue : Colors.grey[200],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message.text,
                  style: TextStyle(
                    color: message.isUser ? Colors.white : Colors.black,
                  ),
                ),
                if (message.resources.isNotEmpty) ...[
                  SizedBox(height: 8),
                  Text(
                    'Suggested Resources:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: message.isUser ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  ...message.resources.map((resource) => Text(
                    '• $resource',
                    style: TextStyle(
                      fontSize: 12,
                      color: message.isUser ? Colors.white70 : Colors.black54,
                    ),
                  )),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? crisisLevel;
  final List<String> resources;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.crisisLevel,
    this.resources = const [],
  });
}
*/

// ============================================================================
// WEB (JavaScript) EXAMPLE
// ============================================================================

/*
// HTML Structure:
// <div id="chat-container">
//   <div id="messages"></div>
//   <input type="text" id="message-input" placeholder="Type your message...">
//   <button id="send-button">Send</button>
// </div>

class WebCareConnectChat {
  constructor() {
    this.messages = [];
    this.sessionId = `web-session-${Date.now()}`;
    this.selectedService = 'mental-health';
    this.isLoading = false;
    
    this.messagesContainer = document.getElementById('messages');
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || this.isLoading) return;

    this.addMessage(message, 'user');
    this.messageInput.value = '';
    this.setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/chat/${this.selectedService}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
        },
        body: JSON.stringify({
          message,
          language: 'en',
          anonymous: false,
        }),
      });

      const data = await response.json();
      
      this.addMessage(data.response, 'ai', {
        crisisLevel: data.crisisLevel,
        resources: data.resources,
      });

      if (data.requiresEscalation) {
        this.showCrisisAlert();
      }

    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(text, sender, metadata = {}) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    
    let html = `<div class="message-text">${text}</div>`;
    
    if (metadata.resources && metadata.resources.length > 0) {
      html += '<div class="resources">';
      html += '<strong>Suggested Resources:</strong><br>';
      metadata.resources.forEach(resource => {
        html += `• ${resource}<br>`;
      });
      html += '</div>';
    }
    
    html += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    
    messageElement.innerHTML = html;
    this.messagesContainer.appendChild(messageElement);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.sendButton.disabled = loading;
    this.sendButton.textContent = loading ? 'Sending...' : 'Send';
  }

  showCrisisAlert() {
    if (confirm('We\'re concerned about what you\'ve shared. Would you like to speak with a human counselor?')) {
      alert('Connecting you with a human counselor...');
    }
  }
}

// Initialize the chat
// const chat = new WebCareConnectChat();
*/

module.exports = { CareConnectChat }; 