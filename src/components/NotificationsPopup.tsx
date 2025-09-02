import { X, Check, UserPlus, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useCommunityRequests } from "@/hooks/useCommunityRequests";
import { useMeetupJoinRequests } from "@/hooks/useMeetupJoinRequests";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopup = ({ isOpen, onClose }: NotificationsPopupProps) => {
  const { notifications, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const { approveMembershipRequest, rejectMembershipRequest, getMembershipRequestDetails, loading: requestLoading } = useCommunityRequests();
  const { handleJoinRequest } = useMeetupJoinRequests();
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleMeetupJoinRequestAction = async (notificationId: string, relatedUserId: string, action: 'approve' | 'decline') => {
    if (processingRequests.has(notificationId)) return;
    
    setProcessingRequests(prev => new Set(prev).add(notificationId));
    
    try {
      // Get the RSVP ID from the notification - we'll need to fetch this
      // For now, we'll get all pending RSVPs for this user and find the right one
      const { data: rsvps, error } = await supabase
        .from('event_rsvps')
        .select('id, event_id, events!inner(title, user_id)')
        .eq('user_id', relatedUserId)
        .eq('status', 'pending');

      if (error || !rsvps?.length) {
        throw new Error('Could not find join request');
      }

      // Find the RSVP that matches this notification
      const rsvp = rsvps[0]; // For now, take the first pending request
      
      const success = await handleJoinRequest(rsvp.id, action === 'approve' ? 'approved' : 'declined');

      if (success) {
        markAsRead(notificationId);
        setTimeout(() => refreshNotifications(), 500);
      }
    } catch (error) {
      console.error('Error handling meetup join request:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleCommunityRequestAction = async (notificationId: string, relatedUserId: string, action: 'approve' | 'reject') => {
    if (processingRequests.has(notificationId)) return;
    
    setProcessingRequests(prev => new Set(prev).add(notificationId));
    
    try {
      const details = await getMembershipRequestDetails(notificationId, relatedUserId);
      if (!details) {
        throw new Error('Failed to get membership request details');
      }

      let success = false;
      if (action === 'approve') {
        success = await approveMembershipRequest(details.membershipId, details.communityName, details.userName);
      } else {
        success = await rejectMembershipRequest(details.membershipId, details.communityName, details.userName);
      }

      if (success) {
        // Mark notification as read and refresh notifications
        markAsRead(notificationId);
        setTimeout(() => refreshNotifications(), 500);
      }
    } catch (error) {
      console.error('Error handling community request:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true
      });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
          <h2 className="text-lg font-bold">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground text-center">
                <div className="mb-2">No new notifications</div>
                <div className="text-sm">We'll update you here about new activities</div>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start gap-3 p-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.is_read)}
              >
                {notification.related_user?.profile_image_url ? (
                  <img 
                    src={notification.related_user.profile_image_url}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">
                      {notification.related_user?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                 )}
                 <div className="flex-1 min-w-0">
                   <div className="flex items-start justify-between gap-2">
                     <p className="text-sm text-foreground leading-relaxed mb-1">
                       {notification.related_user?.name && (
                         <span className="font-medium">{notification.related_user.name} </span>
                       )}
                       {notification.message}
                     </p>
                     {!notification.is_read && (
                       <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                     )}
                   </div>
                   <span className="text-xs text-muted-foreground">
                     {formatTimeAgo(notification.created_at)}
                   </span>
                   
                    {/* Community Join Request Actions */}
                    {notification.type === 'community_join_request' && notification.related_user_id && !processingRequests.has(notification.id) && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="h-7 px-3 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommunityRequestAction(notification.id, notification.related_user_id!, 'approve');
                          }}
                          disabled={requestLoading}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 px-3 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommunityRequestAction(notification.id, notification.related_user_id!, 'reject');
                          }}
                          disabled={requestLoading}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Meetup Join Request Actions */}
                    {notification.type === 'meetup_join_request' && notification.related_user_id && !processingRequests.has(notification.id) && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMeetupJoinRequestAction(notification.id, notification.related_user_id!, 'approve');
                          }}
                          disabled={requestLoading}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMeetupJoinRequestAction(notification.id, notification.related_user_id!, 'decline');
                          }}
                          disabled={requestLoading}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Pass
                        </Button>
                      </div>
                    )}
                   
                   {processingRequests.has(notification.id) && (
                     <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                       <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                       Processing...
                     </div>
                   )}
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPopup;