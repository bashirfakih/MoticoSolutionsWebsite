'use client';

/**
 * Admin Messages Page
 *
 * Message inbox with filtering, read status, and reply functionality.
 *
 * @module app/admin/messages/page
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Star,
  Mail,
  MailOpen,
  Reply,
  Trash2,
  Archive,
  AlertTriangle,
  Clock,
  X,
  Send,
  CheckCircle,
} from 'lucide-react';
import { messageService } from '@/lib/data/messageService';
import { Message, MESSAGE_STATUS, MESSAGE_TYPE, MessageStatus, MessageType } from '@/lib/data/types';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  [MESSAGE_STATUS.UNREAD]: { label: 'Unread', color: 'text-blue-700', bg: 'bg-blue-100' },
  [MESSAGE_STATUS.READ]: { label: 'Read', color: 'text-gray-700', bg: 'bg-gray-100' },
  [MESSAGE_STATUS.REPLIED]: { label: 'Replied', color: 'text-green-700', bg: 'bg-green-100' },
  [MESSAGE_STATUS.ARCHIVED]: { label: 'Archived', color: 'text-purple-700', bg: 'bg-purple-100' },
  [MESSAGE_STATUS.SPAM]: { label: 'Spam', color: 'text-red-700', bg: 'bg-red-100' },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  [MESSAGE_TYPE.CONTACT]: { label: 'Contact', color: 'text-gray-600' },
  [MESSAGE_TYPE.SUPPORT]: { label: 'Support', color: 'text-blue-600' },
  [MESSAGE_TYPE.INQUIRY]: { label: 'Inquiry', color: 'text-purple-600' },
  [MESSAGE_TYPE.FEEDBACK]: { label: 'Feedback', color: 'text-green-600' },
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState<ReturnType<typeof messageService.getStats> | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, search, statusFilter]);

  const loadMessages = () => {
    setMessages(messageService.getAll());
    setStats(messageService.getStats());
  };

  const filterMessages = () => {
    let result = messages;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(searchLower) ||
          m.email.toLowerCase().includes(searchLower) ||
          m.subject.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      result = result.filter(m => m.status === statusFilter);
    }

    setFilteredMessages(result);
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setReplyText('');
    if (message.status === MESSAGE_STATUS.UNREAD) {
      messageService.markAsRead(message.id);
      loadMessages();
    }
  };

  const handleToggleStar = (messageId: string) => {
    messageService.toggleStar(messageId);
    loadMessages();
  };

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    messageService.reply(selectedMessage.id, replyText, 'admin');
    setReplyText('');
    setSelectedMessage(messageService.getById(selectedMessage.id));
    loadMessages();
  };

  const handleArchive = (messageId: string) => {
    messageService.archive(messageId);
    loadMessages();
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      messageService.delete(messageId);
      loadMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  const handleMarkAsSpam = (messageId: string) => {
    messageService.markAsSpam(messageId);
    loadMessages();
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Contact form submissions and inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                <p className="text-xs text-gray-500">Unread</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.replied}</p>
                <p className="text-xs text-gray-500">Replied</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.starred}</p>
                <p className="text-xs text-gray-500">Starred</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            >
              <option value="">All Messages</option>
              {Object.entries(MESSAGE_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {statusConfig[value]?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleSelectMessage(message)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                } ${message.status === MESSAGE_STATUS.UNREAD ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(message.id);
                    }}
                    className={`mt-0.5 ${message.isStarred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                  >
                    <Star className="w-4 h-4" fill={message.isStarred ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm truncate ${message.status === MESSAGE_STATUS.UNREAD ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                        {message.name}
                      </p>
                      <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className={`text-sm truncate ${message.status === MESSAGE_STATUS.UNREAD ? 'font-medium' : ''} text-gray-700`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {message.message.substring(0, 50)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs ${typeConfig[message.type]?.color}`}>
                        {typeConfig[message.type]?.label}
                      </span>
                      {message.status === MESSAGE_STATUS.REPLIED && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Reply className="w-3 h-3" />
                          Replied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No messages found
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{selectedMessage.name}</span>
                      <span>{selectedMessage.email}</span>
                      {selectedMessage.phone && <span>{selectedMessage.phone}</span>}
                    </div>
                    {selectedMessage.company && (
                      <p className="text-sm text-gray-500 mt-0.5">{selectedMessage.company}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleArchive(selectedMessage.id)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMarkAsSpam(selectedMessage.id)}
                      className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Mark as Spam"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Reply if exists */}
                {selectedMessage.replyMessage && (
                  <div className="mt-6 bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Your Reply</span>
                      <span className="text-xs text-green-600">
                        {selectedMessage.repliedAt && new Date(selectedMessage.repliedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-green-900 whitespace-pre-wrap">{selectedMessage.replyMessage}</p>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {selectedMessage.status !== MESSAGE_STATUS.REPLIED && selectedMessage.status !== MESSAGE_STATUS.SPAM && (
                <div className="p-4 border-t border-gray-200">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg font-medium hover:bg-[#003a6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MailOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
