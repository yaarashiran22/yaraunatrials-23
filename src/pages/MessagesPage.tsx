import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      {/* Custom Header for Chat */}
      {selectedUser ? (
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/10 shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSelectedUser()}
                className="h-9 w-9 rounded-full hover:bg-accent/50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage 
                      src={selectedUser.profile_image_url} 
                      className="object-cover w-full h-full"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-sm font-semibold">
                      {(selectedUser.name || 'User').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isUserOnline(selectedUser.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {selectedUser.name || 'User'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isUserOnline(selectedUser.id) ? 'Online now' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
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
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-border/10 shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="h-9 w-9 rounded-full hover:bg-accent/50 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Messages
                  </h1>
                  <p className="text-sm text-muted-foreground">Stay connected</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowUserSelect(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg rounded-full px-4"
                >
                  <Users className="h-4 w-4" />
                  New
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern User Selection Modal */}
      {showUserSelect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl max-w-md w-full h-[600px] max-h-[85vh] shadow-2xl border border-border/20 animate-scale-in flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-border/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
            
            {/* Scrollable Content - FIXED FOR SCROLLING */}
            <div 
              className="flex-1 min-h-0 overflow-y-scroll p-3 bg-background/50" 
              style={{ height: '400px', maxHeight: '400px' }}
            >
              <div className="space-y-2"
                style={{ paddingBottom: '20px' }}
              >
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
                      className="w-full justify-start p-4 h-auto rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                      onClick={() => handleUserSelect(profile.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 mr-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarImage 
                            src={profile.profile_image_url} 
                            className="object-cover w-full h-full"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-sm font-semibold">
                            {(profile.name || profile.email)?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isUserOnline(profile.id) && (
                          <div className="absolute -bottom-0.5 -right-2 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
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

      <div className="flex flex-col h-[calc(100vh-140px)]">
        {!selectedUserId ? (
          /* Modern Conversations List */
          <div className="flex-1 px-4 py-2">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your chats...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto">
                        <MessageCircle className="h-10 w-10 text-primary opacity-70" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Your inbox awaits
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start meaningful conversations with people around you
                    </p>
                    <Button 
                      onClick={() => setShowUserSelect(true)}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg rounded-full px-6"
                    >
                      Start Chatting
                    </Button>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div
                      key={conversation.user.id}
                      className="animate-fade-in relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-4 h-auto rounded-2xl hover:bg-accent/50 transition-all duration-200 group border-2 border-border/10 hover:border-primary/20 hover:shadow-lg bg-card/50"
                        onClick={() => handleUserSelect(conversation.user.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-14 w-14 mr-4 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                            <AvatarImage 
                              src={conversation.user.profile_image_url} 
                              className="object-cover w-full h-full"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 font-semibold text-base">
                              {(conversation.user.name || conversation.user.email)?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isUserOnline(conversation.user.id) && (
                            <div className="absolute -bottom-1 -right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-2 min-w-5 h-5 bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {conversation.user.name || 'User'}
                            </h4>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                {format(new Date(conversation.lastMessage.created_at), 'HH:mm')}
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
                      
                      {/* Subtle separator line */}
                      {index < conversations.length - 1 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mt-4" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Modern Chat Messages */
          <>
            {/* Chat Background Pattern */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-muted/5 to-muted/10" />
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }} />
              
              <ScrollArea className="h-full p-4 relative z-10">
                <div className="space-y-4 pb-4">
                  {currentMessages.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-primary opacity-70" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
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
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {!isFromCurrentUser && (
                            <Avatar className="h-8 w-8 mb-1">
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
                            className={`group relative max-w-[75%] ${
                              isFromCurrentUser
                                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-br-md'
                                : 'bg-card border border-border/20 text-foreground rounded-2xl rounded-bl-md'
                            } p-3 shadow-sm hover:shadow-md transition-all duration-200`}
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
                                  className="h-5 w-5 opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity rounded-full"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Message tail */}
                            <div
                              className={`absolute bottom-0 w-3 h-3 ${
                                isFromCurrentUser
                                  ? '-right-1 bg-primary transform rotate-45'
                                  : '-left-1 bg-card border-l border-b border-border/20 transform rotate-45'
                              }`}
                            />
                          </div>
                          
                          {isFromCurrentUser && (
                            <Avatar className="h-8 w-8 mb-1">
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

            {/* Modern Message Input */}
            <div className="border-t border-border/10 bg-card/95 backdrop-blur-lg p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedUser?.name || 'user'}...`}
                    className="pr-12 rounded-2xl border-border/20 bg-muted/50 focus:bg-background transition-colors min-h-[44px] resize-none"
                    disabled={sending}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  className="h-11 w-11 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
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