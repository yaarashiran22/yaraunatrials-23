import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Trash2, Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MessagesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    conversations, 
    currentMessages, 
    allUsers, 
    loading, 
    sending, 
    usersLoading,
    selectedUserId,
    fetchMessagesWithUser,
    sendMessage,
    deleteMessage,
    clearSelectedUser
  } = useDirectMessages();
  
  const [newMessage, setNewMessage] = useState('');
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    
    const success = await sendMessage(selectedUserId, newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleUserSelect = (userId: string) => {
    fetchMessagesWithUser(userId);
    setShowUserSelect(false);
    setSearchQuery(''); // Reset search when closing
  };

  // Filter users based on search query
  const filteredUsers = allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSelectedUser = () => {
    if (!selectedUserId) return null;
    return allUsers.find(u => u.id === selectedUserId) || 
           conversations.find(c => c.user.id === selectedUserId)?.user;
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

  const selectedUser = getSelectedUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => selectedUserId ? clearSelectedUser() : navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
              {selectedUser ? selectedUser.name || 'User' : 'Messages'}
            </h1>
          </div>
          {!selectedUserId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserSelect(true)}
              className="gap-2 border-orange-400 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              style={{
                borderColor: 'hsl(20 90% 60%)',
                color: 'hsl(20 90% 50%)'
              }}
            >
              <Users className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* User Selection Modal */}
      {showUserSelect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Select User</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUserSelect(false);
                    setSearchQuery('');
                  }}
                >
                  ×
                </Button>
              </div>
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <ScrollArea className="max-h-96">
              <div className="p-2">
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto mb-2" />
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No users found matching your search' : 'No users available'}
                  </div>
                ) : (
                  filteredUsers.map((profile) => (
                    <Button
                      key={profile.id}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => handleUserSelect(profile.id)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={profile.profile_image_url} />
                        <AvatarFallback>
                          {(profile.name || profile.email)?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{profile.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-80px)]">
        {!selectedUserId ? (
          /* Conversations List */
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No conversations yet</p>
                  <p className="text-sm">Start a new chat by selecting a user!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <Button
                    key={conversation.user.id}
                    variant="ghost"
                    className="w-full justify-start p-4 h-auto border border-border rounded-lg hover:bg-accent"
                    onClick={() => handleUserSelect(conversation.user.id)}
                  >
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={conversation.user.profile_image_url} />
                      <AvatarFallback>
                        {(conversation.user.name || conversation.user.email)?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">
                          {conversation.user.name || 'User'}
                        </p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(conversation.lastMessage.created_at), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.message}
                        </p>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full mt-1">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        ) : (
          /* Chat Messages */
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map((message) => {
                    const isFromCurrentUser = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isFromCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className="text-xs opacity-70">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </span>
                            {isFromCurrentUser && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteMessage(message.id)}
                                className="h-6 w-6 opacity-70 hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
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
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;