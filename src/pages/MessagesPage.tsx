import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Trash2, Users, MessageCircle, Search, MoreHorizontal, Phone, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import NotificationsPopup from '@/components/NotificationsPopup';

const MessagesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isUserOnline } = useUserPresence();
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [avatarLoadErrors, setAvatarLoadErrors] = useState<Set<string>>(new Set());

  // Handle avatar loading errors
  const handleAvatarError = (userId: string) => {
    setAvatarLoadErrors(prev => new Set([...prev, userId]));
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    
    const success = await sendMessage(selectedUserId, newMessage);
    if (success) {
      setNewMessage('');
      setIsTyping(false);
      // Reset textarea height
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
      }
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
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      {/* Custom Header for Chat */}
      {selectedUser ? (
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/20 shadow-sm">
          <div className="px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSelectedUser()}
                className="h-10 w-10 rounded-full hover:bg-accent/50 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage 
                      src={selectedUser.profile_image_url} 
                      className="object-cover w-full h-full transition-opacity duration-200"
                      onError={() => handleAvatarError(selectedUser.id)}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-sm font-semibold">
                      {(selectedUser.name || 'User').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isUserOnline(selectedUser.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {selectedUser.name || 'User'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isUserOnline(selectedUser.id) ? 'Online now' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full hover:bg-accent/50">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full hover:bg-accent/50">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full hover:bg-accent/50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/20 shadow-sm">
          <div className="px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="h-10 w-10 rounded-full hover:bg-accent/50 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    Messages
                  </h1>
                  <p className="text-xs text-muted-foreground">Stay connected</p>
                </div>
              </div>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowUserSelect(true)}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-sm rounded-full px-4 h-9"
              >
                <Users className="h-4 w-4" />
                New
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern User Selection Modal */}
      {showUserSelect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl max-w-md w-full h-[600px] shadow-2xl border border-border/20 animate-scale-in flex flex-col">
            {/* Fixed Header */}
            <div className="p-4 border-b border-border/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">
                  Start a Chat
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUserSelect(false);
                    setSearchQuery('');
                  }}
                  className="h-8 w-8 rounded-full hover:bg-accent/50"
                >
                  ×
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for someone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-border/20 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
            
            {/* Scrollable Content - Fixed height with proper scrolling */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {usersLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-3" />
                    <p className="text-sm">Finding people...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium mb-1">
                      {searchQuery ? 'No matches found' : 'No users available'}
                    </p>
                    <p className="text-sm">
                      {searchQuery ? 'Try a different search term' : 'Check back later'}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((profile) => (
                    <Button
                      key={profile.id}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                      onClick={() => handleUserSelect(profile.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 mr-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarImage 
                            src={profile.profile_image_url} 
                            className="object-cover w-full h-full"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-sm font-semibold">
                            {(profile.name || profile.email)?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isUserOnline(profile.id) && (
                          <div className="absolute -bottom-0.5 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {profile.name || 'User'}
                        </p>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Proper flex layout */}
      <div className="flex-1 flex flex-col min-h-0">
        {!selectedUserId ? (
          /* Modern Conversations List */
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 rounded-xl bg-card border border-border/10">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-20 px-6">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto">
                        <MessageCircle className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      Your inbox awaits
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Start meaningful conversations with people around you
                    </p>
                    <Button 
                      onClick={() => setShowUserSelect(true)}
                      className="bg-primary hover:bg-primary/90 shadow-sm rounded-full px-6"
                    >
                      Start Chatting
                    </Button>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div
                      key={conversation.user.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-4 h-auto rounded-xl hover:bg-accent/50 transition-all duration-200 group border border-border/10 hover:border-primary/20 bg-card/50"
                        onClick={() => handleUserSelect(conversation.user.id)}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12 mr-3 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                            <AvatarImage 
                              src={conversation.user.profile_image_url} 
                              className="object-cover w-full h-full transition-opacity duration-200"
                              onError={() => handleAvatarError(conversation.user.id)}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 font-semibold">
                              {(conversation.user.name || conversation.user.email)?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isUserOnline(conversation.user.id) && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate text-sm">
                              {conversation.user.name || 'User'}
                            </h4>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full flex-shrink-0">
                                {format(new Date(conversation.lastMessage.created_at), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage.message}
                            </p>
                          )}
                        </div>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Modern Chat Messages */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-muted/5 to-muted/10" />
              
              <ScrollArea className="h-full relative z-10">
                <div className="p-4 space-y-4 pb-6">
                  {currentMessages.length === 0 ? (
                    <div className="text-center py-20 px-6">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Start the conversation</h3>
                      <p className="text-muted-foreground text-sm">
                        Send your first message to {selectedUser?.name || 'this person'}
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((message, index) => {
                      const isFromCurrentUser = message.sender_id === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 animate-fade-in ${
                            isFromCurrentUser ? 'justify-end' : 'justify-start'
                          }`}
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          {!isFromCurrentUser && (
                            <Avatar className="h-7 w-7 mb-1 flex-shrink-0">
                              <AvatarImage 
                                src={selectedUser?.profile_image_url} 
                                className="object-cover w-full h-full"
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-muted to-muted/80 font-medium">
                                {(selectedUser?.name || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={`group relative max-w-[80%] transition-all duration-200 ${
                              isFromCurrentUser
                                ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm'
                                : 'bg-card border border-border/20 text-foreground rounded-2xl rounded-bl-md shadow-sm'
                            } p-3`}
                          >
                            <p className="text-sm leading-relaxed break-words">{message.message}</p>
                            
                            <div className={`flex items-center justify-between mt-2 gap-2 ${
                              isFromCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span className="text-xs">
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                              {isFromCurrentUser && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteMessage(message.id)}
                                  className="h-4 w-4 opacity-0 group-hover:opacity-70 hover:opacity-100 transition-all duration-200 rounded-full hover:bg-primary-foreground/20"
                                  aria-label="Delete message"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {isFromCurrentUser && (
                            <Avatar className="h-7 w-7 mb-1 flex-shrink-0">
                              <AvatarImage 
                                src={user?.user_metadata?.avatar_url} 
                                className="object-cover w-full h-full"
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/40 font-medium">
                                {(user?.email || 'Y').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input - Always visible at bottom */}
            <div className="border-t border-border/10 bg-card p-4 flex-shrink-0">
              {isTyping && (
                <div className="mb-2 text-xs text-muted-foreground animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                    <span>You're typing...</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={newMessage}
                    onChange={handleTextareaChange}
                    placeholder={`Message ${selectedUser?.name || 'user'}...`}
                    className="min-h-[44px] max-h-[120px] resize-none rounded-2xl border-border/20 bg-muted/50 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-12"
                    disabled={sending}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  {newMessage.length > 0 && (
                    <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                      {newMessage.length}/500
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <BottomNavigation />
    </div>
  );
};

export default MessagesPage;