import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopup = ({ isOpen, onClose }: NotificationsPopupProps) => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: he
      });
    } catch {
      return "זמן לא ידוע";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-background rounded-t-3xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold">התראות</h2>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              סמן הכל כנקרא
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">טוען התראות...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground text-center">
                <div className="mb-2">אין התראות חדשות</div>
                <div className="text-sm">נעדכן אותך כאן על פעילויות חדשות</div>
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