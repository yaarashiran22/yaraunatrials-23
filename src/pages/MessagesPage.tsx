import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMessages } from '@/hooks/useUserMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

const MessagesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { messages, loading, creating, updating, createMessage, updateMessage, deleteMessage } = useUserMessages();
  
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const success = await createMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;
    
    const success = await updateMessage(messageId, editText);
    if (success) {
      setEditingId(null);
      setEditText('');
    }
  };

  const startEditing = (messageId: string, currentText: string) => {
    setEditingId(messageId);
    setEditText(currentText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in to access messages</h2>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Send your first message below!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-card rounded-lg p-4 border border-border">
                  {editingId === message.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Edit your message..."
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditMessage(message.id)}
                          disabled={updating === message.id}
                        >
                          {updating === message.id ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditing(message.id, message.message)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMessage(message.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-foreground">{message.message}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={creating}
            />
            <Button type="submit" disabled={creating || !newMessage.trim()}>
              {creating ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;