'use client';

import { useState } from 'react';
import { X, Clock, Mail, Calendar, AlertCircle, Check } from 'lucide-react';

interface ReminderAgentProps {
  onClose: () => void;
}

export default function ReminderAgent({ onClose }: ReminderAgentProps) {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task.trim() || !date || !time || !email.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: task.trim(),
          date,
          time,
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set reminder');
      }

      const data = await response.json();
      setMessage({ type: 'success', text: data.message || 'Reminder set successfully!' });
      
      // Clear form after successful submission
      setTimeout(() => {
        setTask('');
        setDate('');
        setTime('');
        setEmail('');
        setMessage(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error setting reminder:', error);
      setMessage({ type: 'error', text: 'Failed to set reminder. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (quickTask: string, hours: number) => {
    setTask(quickTask);
    const now = new Date();
    now.setHours(now.getHours() + hours);
    
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    
    setDate(dateStr);
    setTime(timeStr);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Reminder Agent</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800'
            : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <Check size={16} className="text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm ${
            message.type === 'success' 
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick reminders:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFill('Take a break', 1)}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
          >
            Break in 1 hour
          </button>
          <button
            onClick={() => handleQuickFill('Check emails', 2)}
            className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors"
          >
            Check emails in 2 hours
          </button>
          <button
            onClick={() => handleQuickFill('Daily standup meeting', 24)}
            className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
          >
            Meeting tomorrow
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Input */}
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reminder Task
          </label>
          <textarea
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Please remind me to..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !task.trim() || !date || !time || !email.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting Reminder...</span>
              </>
            ) : (
              <>
                <Clock size={16} />
                <span>Set Reminder</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>How it works:</strong> The AI agent will send you an email reminder at the specified time. 
          Make sure to configure your email settings in the environment variables.
        </p>
      </div>
    </div>
  );
}