import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopup = ({ isOpen, onClose }: NotificationsPopupProps) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      avatar: profile1,
      text: "דנה הוסיפה תמונה חדשה למוצרים יד שנייה של גילה",
      time: "לפני 2 שעות"
    },
    {
      id: 2,
      avatar: profile2,
      text: "רון פרסם פוסט חדש בקבוצת השכונה על אירוע קהילתי בפארק",
      time: "לפני 4 שעות"
    },
    {
      id: 3,
      avatar: profile3,
      text: "שרי עזבה תגובה",
      time: "לפני יום אחד"
    },
    {
      id: 4,
      avatar: profile1,
      text: "פתיחת בתי קפה חדשים ברשת לכל בית קפה בעיר בקרבת מקום",
      time: "לפני יומיים"
    },
    {
      id: 5,
      avatar: profile2,
      text: "יעל הסינטטית אמירה",
      time: "לפני יומיים"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-background rounded-t-3xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold">התראות</h2>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 p-4 border-b border-border/50 hover:bg-muted/50">
              <img 
                src={notification.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed mb-1">
                  {notification.text}
                </p>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPopup;