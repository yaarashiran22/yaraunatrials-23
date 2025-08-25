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
        <div className="bg-card border-b border-border sticky top-16 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community</h1>
                <p className="text-sm text-muted-foreground">Discover and join communities around you</p>
              </div>
              <CreateCommunityDialog />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="my-communities" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                My Communities ({myCommunities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              {/* Category Filter */}
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏘️</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No communities found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a community!'}
                  </p>
                  <CreateCommunityDialog />
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-communities" className="space-y-4">
              {!user ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Login Required</h3>
                  <p className="text-muted-foreground">Please login to view your communities</p>
                </div>
              ) : (
                <>
                  {/* Pending Requests */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">Pending Requests</h3>
                        <Badge variant="secondary">{pendingRequests.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingRequests.map(community => (
                          <CommunityCard key={community.id} community={community} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* My Communities */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Joined Communities</h3>
                    
                    {myCommunities.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No Communities Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Join communities to connect with like-minded people
                        </p>
                        <Button onClick={() => {
                          const discoverTab = document.querySelector('[value="discover"]') as HTMLElement;
                          discoverTab?.click();
                        }}>
                          Discover Communities
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CommunitiesPage;