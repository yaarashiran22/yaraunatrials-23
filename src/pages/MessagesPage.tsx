import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Trash2, Users, MessageCircle, Search, MoreHorizontal, Phone, Video, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import NotificationsPopup from '@/components/NotificationsPopup';
import DesktopHeader from '@/components/DesktopHeader';

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
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
        title={selectedUser ? selectedUser.name || "User" : "Inbox"}
        />
      </div>
      
      {/* Desktop Header */}
      <DesktopHeader 
        title={selectedUser ? selectedUser.name || "User" : "Inbox"}
        showSearch={false}
      />
      {/* Custom Chat Headers - Only for mobile conversation view */}
      {selectedUser ? (
        <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border/20 shadow-sm lg:hidden">
          <div className="px-6 py-5 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSelectedUser()}
                className="h-12 w-12 rounded-full hover:bg-accent/50 transition-all duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-bold text-foreground truncate text-lg">
                    {selectedUser.name || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isUserOnline(selectedUser.id) ? 'Online now' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-11 w-11 rounded-full hover:bg-accent/50">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-11 w-11 rounded-full hover:bg-accent/50">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-11 w-11 rounded-full hover:bg-accent/50">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border/20 shadow-sm lg:hidden">
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
              </div>
              
              <div className="flex-1 text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary-600 to-secondary text-transparent bg-clip-text">
                  Inbox
                </h1>
              </div>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowUserSelect(true)}
                className="bg-primary hover:bg-primary/90 shadow-sm rounded-full h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern User Selection Modal with improved styling */}
      {showUserSelect && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-card to-card/95 rounded-3xl max-w-md w-full h-[650px] shadow-2xl border border-border/30 animate-scale-in flex flex-col backdrop-blur-lg">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-border/20 flex-shrink-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                    Start a Chat
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Connect with people around you</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUserSelect(false);
                    setSearchQuery('');
                  }}
                  className="h-10 w-10 rounded-full hover:bg-accent/50 shadow-sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for someone to chat with..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-2xl border-border/30 bg-background/80 focus:bg-background transition-all duration-200 shadow-sm focus:shadow-md"
                />
              </div>
            </div>
            
            {/* Scrollable Content with improved styling */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {usersLoading ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="relative mb-6">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
                      <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10 mx-auto" />
                    </div>
                    <p className="text-lg font-medium mb-2">Finding people...</p>
                    <p className="text-sm">Discovering your community</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">
                      {searchQuery ? 'No matches found' : 'No users available'}
                    </h3>
                    <p className="text-sm">
                      {searchQuery ? 'Try a different search term' : 'Check back later for new connections'}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((profile, index) => (
                    <Button
                      key={profile.id}
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg"
                      onClick={() => handleUserSelect(profile.id)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 mr-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200 shadow-md">
                          <AvatarImage 
                            src={profile.profile_image_url} 
                            className="object-cover w-full h-full"
                          />
                              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-secondary/30 text-sm font-bold text-foreground">
                                {(profile.name || profile.email)?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                        </Avatar>
                        {isUserOnline(profile.id) && (
                          <div className="absolute -bottom-1 -right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate text-base">
                          {profile.name || 'User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isUserOnline(profile.id) ? 'Online now' : 'Tap to connect'}
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
                  <div className="text-center py-24 px-6">
                    <div className="relative mb-8">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center mx-auto shadow-xl">
                        <MessageCircle className="h-10 w-10 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-coral to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                      Your inbox awaits
                    </h3>
                    <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm mx-auto">
                      Start meaningful conversations with people around you and build lasting connections
                    </p>
                    <Button 
                      onClick={() => setShowUserSelect(true)}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl rounded-full px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Users className="h-5 w-5 mr-2" />
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
                        className="w-full justify-start p-4 h-auto rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 group border border-border/10 hover:border-primary/30 bg-gradient-to-r from-card/80 to-card hover:shadow-lg"
                        onClick={() => handleUserSelect(conversation.user.id)}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12 mr-3 ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all duration-200 shadow-sm">
                            <AvatarImage 
                              src={conversation.user.profile_image_url} 
                              className="object-cover w-full h-full transition-opacity duration-200"
                              onError={() => handleAvatarError(conversation.user.id)}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-secondary/30 font-bold text-foreground">
                              {(conversation.user.name || conversation.user.email)?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isUserOnline(conversation.user.id) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-0.5 -right-0.5 min-w-5 h-5 bg-gradient-to-r from-coral to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-md animate-bounce">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate text-base">
                              {conversation.user.name || 'User'}
                            </h4>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground bg-gradient-to-r from-muted/60 to-muted/40 px-2 py-1 rounded-full flex-shrink-0 shadow-sm">
                                {format(new Date(conversation.lastMessage.created_at), 'MMM d')}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate leading-relaxed">
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
                                 {format(new Date(message.created_at), 'MMM d')}
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
                            <Avatar className="h-8 w-8 mb-1 flex-shrink-0 shadow-md ring-2 ring-white/20">
                              <AvatarImage 
                                src={user?.user_metadata?.avatar_url} 
                                className="object-cover w-full h-full"
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-secondary/30 to-primary/30 font-bold text-white">
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

            {/* Enhanced Message Input Area */}
            <div className="border-t border-border/20 bg-gradient-to-r from-card/95 to-card p-5 flex-shrink-0 backdrop-blur-sm">
              {isTyping && (
                <div className="mb-3 text-sm text-muted-foreground animate-fade-in">
                  <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full max-w-fit">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                    <span className="font-medium">You are typing...</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={newMessage}
                    onChange={handleTextareaChange}
                    placeholder={`Message ${selectedUser?.name || 'user'}...`}
                    className="min-h-[52px] max-h-[120px] resize-none rounded-3xl border-border/30 bg-background/80 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/30 pr-16 text-base leading-relaxed shadow-sm focus:shadow-md"
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
                    <div className="absolute bottom-3 right-16 text-xs text-muted-foreground bg-muted/70 px-2 py-1 rounded-full">
                      {newMessage.length}/500
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  className="h-13 w-13 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 hover:scale-110 active:scale-95"
                >
                  {sending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
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