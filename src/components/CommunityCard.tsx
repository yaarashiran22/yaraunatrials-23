import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, UserPlus } from "lucide-react";
import { Community, useCommunityMembership } from "@/hooks/useCommunities";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EditCommunityDialog from "./EditCommunityDialog";

interface CommunityCardProps {
  community: Community;
  onClick?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const CommunityCard = ({ community, onClick, onUpdate, onDelete }: CommunityCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { requestToJoin, getMembershipStatus } = useCommunityMembership();
  const [joining, setJoining] = useState(false);

  const membershipStatus = getMembershipStatus(community.id);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'interests': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'causes': return 'bg-green-100 text-green-800 border-green-200';
      case 'identity': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessIcon = (accessType: string) => {
    switch (accessType) {
      case 'open': return <Globe className="w-3 h-3" />;
      case 'closed': return <Lock className="w-3 h-3" />;
      case 'invite_only': return <UserPlus className="w-3 h-3" />;
      default: return <Lock className="w-3 h-3" />;
    }
  };

  const getAccessLabel = (accessType: string) => {
    switch (accessType) {
      case 'open': return 'Open';
      case 'closed': return 'Approval Required';
      case 'invite_only': return 'Invite Only';
      default: return 'Closed';
    }
  };

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to join communities",
        variant: "destructive",
      });
      return;
    }

    if (community.access_type === 'invite_only') {
      toast({
        title: "Invite Only",
        description: "This community is invite only",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoining(true);
      await requestToJoin(community.id);
      
      toast({
        title: community.access_type === 'open' ? "Joined!" : "Request Sent!",
        description: community.access_type === 'open' 
          ? `You've joined ${community.name}` 
          : `Your request to join ${community.name} has been sent`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const getJoinButtonText = () => {
    if (membershipStatus) {
      switch (membershipStatus.status) {
        case 'approved': return 'Member';
        case 'pending': return 'Pending';
        case 'declined': return 'Declined';
        default: return 'Join';
      }
    }
    return community.access_type === 'open' ? 'Join' : 'Request to Join';
  };

  const isJoinDisabled = () => {
    return membershipStatus?.status === 'approved' || 
           membershipStatus?.status === 'pending' ||
           community.access_type === 'invite_only';
  };

  return (
    <div 
      className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden w-full aspect-[3/2] flex flex-col"
      onClick={() => onClick && onClick()}
    >
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/20 relative flex-shrink-0">
        {community.cover_image_url ? (
          <img 
            src={community.cover_image_url} 
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl opacity-50">🏘️</div>
          </div>
        )}

        {/* Access Type Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-white/90">
            {getAccessIcon(community.access_type)}
            {getAccessLabel(community.access_type)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-4 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-h-0 pr-2">
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1 text-sm">{community.name}</h3>
            {community.tagline && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{community.tagline}</p>
            )}
          </div>
          {/* Member Count */}
          <div className="flex items-center gap-1 text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-full flex-shrink-0">
            <Users className="w-3 h-3" />
            <span>{community.member_count}</span>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center justify-center mb-3">
          <Badge className={`text-xs capitalize ${getCategoryColor(community.category)}`}>
            {community.subcategory || community.category}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Edit/Delete for community creator */}
          {user && community.creator_id === user.id && (
            <div className="flex gap-2 mb-2">
              <EditCommunityDialog 
                community={community} 
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          )}
          
          {/* Join Button for non-creators */}
          {(!user || community.creator_id !== user.id) && (
            <Button
              onClick={handleJoinClick}
              disabled={isJoinDisabled() || joining}
              className="w-full"
              variant={membershipStatus?.status === 'approved' ? "secondary" : "default"}
              size="sm"
            >
              {joining ? "..." : getJoinButtonText()}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;