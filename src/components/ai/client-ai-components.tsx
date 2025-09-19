'use client';

/**
 * Client-side wrapper components for safely using AI features 
 * without causing hydration issues.
 * 
 * IMPORTANT: These components defer all actual AI processing 
 * to server actions to avoid client-side dependencies on server-only libraries.
 */

import React, { useState } from 'react';
import { classifyWasteImage, getTrainingChatbotResponse } from '@/lib/ai-server-actions';

// Client-safe training chatbot component
export function ClientChatbotAssistant({
  onMessage,
  initialHistory = []
}: {
  onMessage: (message: string) => void;
  initialHistory?: Array<{role: string; content: string}>;
}) {
  const [history, setHistory] = useState(initialHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    setInputValue('');
    
    // Add user message to history
    const newHistory = [
      ...history,
      { role: 'user', content: userMessage }
    ];
    setHistory(newHistory);
    
    // Process via server action
    setIsLoading(true);
    try {
      const response = await getTrainingChatbotResponse(userMessage, newHistory);
      if (response.success && response.data) {
        // Add AI response to history
        setHistory([
          ...newHistory,
          { role: 'assistant', content: response.data.response }
        ]);
        
        // Notify parent component
        onMessage(response.data.response);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setHistory([
        ...newHistory,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat messages */}
      <div className="messages-container">
        {history.map((msg, i) => (
          <div key={i} className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

// Client-safe waste classification component
export function ClientWasteClassifier({
  onClassify,
}: {
  onClassify: (result: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setIsLoading(true);
    try {
      const response = await classifyWasteImage(formData);
      if (response.success && response.data) {
        onClassify(response.data);
      } else {
        throw new Error(response.error || 'Failed to classify waste');
      }
    } catch (error) {
      console.error('Error classifying waste:', error);
      onClassify(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="waste-classifier">
      <input 
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isLoading}
      />
      {isLoading && <div className="loading-indicator">Processing...</div>}
    </div>
  );
}
