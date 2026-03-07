import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Send } from 'lucide-react';

export function GroundMessages() {
  const { messages, addMessage, currentUser } = useApp();
  const [newMessage, setNewMessage] = useState('');

  const groundMessages = messages.filter(m => m.role === 'ground-staff');

  const handleSend = () => {
    if (newMessage.trim() && currentUser) {
      addMessage({
        role: 'ground-staff',
        content: newMessage,
        author: currentUser.username,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Message Board</h1>
        <p className="text-gray-500 mt-1">Internal notes and communication for ground staff</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Messages List */}
        <div className="p-6 max-h-96 overflow-y-auto border-b border-gray-200">
          {groundMessages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {groundMessages.map((message) => (
                <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">{message.author}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Message */}
        <div className="p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
