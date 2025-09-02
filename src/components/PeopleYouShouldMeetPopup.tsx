import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, X } from 'lucide-react';

interface SuggestedUser {
  id: string;
  name: string;
  profile_image_url?: string;
  sharedEvents: string[];
  sharedEventCount: number;
}

interface PeopleYouShouldMeetPopupProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedUsers: SuggestedUser[];
  loading: boolean;
}

const PeopleYouShouldMeetPopup = ({
  isOpen,
  onClose,
  suggestedUsers,
  loading
}: PeopleYouShouldMeetPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            People You Should Meet
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Finding people with similar interests...</p>
            </div>
          ) : suggestedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No matches found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We couldn't find users who have RSVPed to similar events. Try attending more events to find people with similar interests!
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                These users have RSVPed to {suggestedUsers.length > 1 ? 'at least 2 similar events' : 'similar events'} as you:
              </p>
              
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profile_image_url} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {user.name || 'Anonymous User'}
                      </h4>
                      
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {user.sharedEventCount} shared event{user.sharedEventCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {user.sharedEvents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.sharedEvents.slice(0, 2).map((event, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {event.length > 20 ? `${event.substring(0, 20)}...` : event}
                            </Badge>
                          ))}
                          {user.sharedEvents.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.sharedEvents.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                Connect with people who share your interests!
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PeopleYouShouldMeetPopup;