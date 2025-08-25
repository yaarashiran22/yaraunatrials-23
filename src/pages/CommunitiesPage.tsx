import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Calendar, Gift, MessageSquare, Target, Sprout, UserCheck, Home } from "lucide-react";
import { useCommunities, useCommunityMembership } from "@/hooks/useCommunities";
import CommunityCard from "@/components/CommunityCard";
import CreateCommunityDialog from "@/components/CreateCommunityDialog";
import Header from "@/components/Header";
import DesktopHeader from "@/components/DesktopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingSkeleton from "@/components/LoadingSkeleton";

const CommunitiesPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { communities, loading } = useCommunities();
  const { memberships } = useCommunityMembership();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDiscover, setShowDiscover] = useState(false);

  const categories = [
    { id: 'all', label: 'All', icon: Home, color: "text-muted-foreground", activeBg: "bg-muted/80" },
    { id: 'interests', label: 'Interests', icon: Target, color: "text-blue-500", activeBg: "bg-blue-50 dark:bg-blue-950/30" },
    { id: 'causes', label: 'Causes', icon: Sprout, color: "text-green-500", activeBg: "bg-green-50 dark:bg-green-950/30" },
    { id: 'identity', label: 'Identity', icon: UserCheck, color: "text-purple-500", activeBg: "bg-purple-50 dark:bg-purple-950/30" },
  ];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const myCommunities = communities.filter(community => 
    memberships.some(m => m.community_id === community.id && m.status === 'approved')
  );

  const pendingRequests = communities.filter(community => 
    memberships.some(m => m.community_id === community.id && m.status === 'pending')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <DesktopHeader />
        <div className="p-4 space-y-6 pb-20">
          <LoadingSkeleton type="cards" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DesktopHeader />
      
      <div className="pb-20">
        {/* Communities Header */}
        <div className="bg-background/95 backdrop-blur-sm sticky top-16 z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CreateCommunityDialog />
              {user && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDiscover(!showDiscover)}
                  className="flex items-center gap-2 rounded-full"
                >
                  {showDiscover ? (
                    <>
                      <Users className="w-4 h-4" />
                      My Communities
                    </>
                  ) : (
                    <>Join Communities</>
                  )}
                </Button>
              )}
            </div>

            {/* Search - only show in discover mode */}
            {showDiscover && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full bg-muted/50 border-0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          {!showDiscover ? (
            <div className="space-y-4">
              {!user ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Login Required</h3>
                  <p className="text-muted-foreground">Please login to view your communities</p>
                </div>
              ) : (
                <>
                  {/* My Communities */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full">{myCommunities.length}</Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDiscover(true)}
                          className="flex items-center gap-2 rounded-full"
                        >
                          Join Communities
                        </Button>
                      </div>
                    </div>
                    
                    {myCommunities.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Communities Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                          Join communities to connect with like-minded people in your area
                        </p>
                        <Button onClick={() => setShowDiscover(true)} className="rounded-full">
                          Join Communities
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {myCommunities.map(community => (
                          <CommunityCard
                            key={community.id}
                            community={community}
                            onClick={() => {
                              // TODO: Navigate to community detail page
                              console.log('Navigate to community:', community.id);
                            }}
                            onUpdate={() => window.location.reload()}
                            onDelete={() => window.location.reload()}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Requests */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">{pendingRequests.length} pending</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {pendingRequests.map(community => (
                          <CommunityCard key={community.id} community={community} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 
                        flex items-center gap-2 min-w-fit border border-transparent
                        ${selectedCategory === category.id 
                          ? `${category.activeBg} ${category.color} border-current/20` 
                          : `${category.color} hover:bg-accent/50`
                        }
                      `}
                    >
                      <IconComponent className={`h-4 w-4 ${category.color}`} />
                      {category.label}
                    </Button>
                  );
                })}
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {filteredCommunities.length} communities found
              </div>

              {/* Communities Grid */}
              <div className="grid grid-cols-1 gap-3">
                {filteredCommunities.map(community => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onClick={() => {
                      // TODO: Navigate to community detail page
                      console.log('Navigate to community:', community.id);
                    }}
                    onUpdate={() => window.location.reload()}
                    onDelete={() => window.location.reload()}
                  />
                ))}
              </div>

              {filteredCommunities.length === 0 && (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No communities found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a community!'}
                  </p>
                  <CreateCommunityDialog />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CommunitiesPage;