import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfilesPagination } from "@/hooks/useProfilesPagination";
import { OptimizedProfile } from "@/hooks/useOptimizedHomepage";
import ProfileCard from "@/components/ProfileCard";
import AddStoryButton from "@/components/AddStoryButton";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SectionHeader from "@/components/SectionHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface NeighborsSectionProps {
  initialProfiles: OptimizedProfile[];
  loading: boolean;
}

const NeighborsSection = ({ initialProfiles, loading }: NeighborsSectionProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile(user?.id);
  const { profiles: paginatedProfiles, loadMore, hasMore, isLoading: paginatedLoading } = useProfilesPagination();
  
  const [showPaginated, setShowPaginated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Combine initial profiles with paginated profiles, avoiding duplicates
  const allProfiles = (() => {
    if (!showPaginated) {
      return initialProfiles;
    }

    const initialIds = new Set(initialProfiles.map(p => p.id));
    const uniquePaginatedProfiles = paginatedProfiles.filter(p => !initialIds.has(p.id));
    return [...initialProfiles, ...uniquePaginatedProfiles];
  })();

  // Create display profiles with current user first if authenticated
  const displayProfiles = (() => {
    if (!user || !currentUserProfile) {
      return allProfiles;
    }

    // Filter out current user from other profiles to avoid duplicates
    const otherProfiles = allProfiles.filter(p => p.id !== user.id);
    
    // Add current user's profile first
    const currentUserDisplayProfile = {
      id: user.id,
      name: currentUserProfile.name || 'אתה',
      image: currentUserProfile.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"
    };

    return [currentUserDisplayProfile, ...otherProfiles];
  })();

  // Setup intersection observer for infinite scroll
  const lastProfileRef = useCallback((node: HTMLDivElement) => {
    if (loading || paginatedLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && showPaginated) {
        loadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, paginatedLoading, hasMore, showPaginated, loadMore]);

  // Show paginated profiles when user scrolls near the end of initial profiles
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || showPaginated) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;
      
      if (scrollPercentage > 0.8) { // When 80% scrolled
        setShowPaginated(true);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [showPaginated]);

  return (
    <section className="mb-8 lg:mb-10">
      <div className="relative z-10">
        <SectionHeader 
          title={`${t('sections.neighbors')} ${displayProfiles.length > 0 ? `(${displayProfiles.length}${hasMore && showPaginated ? '+' : ''})` : ''}`} 
        />
      </div>
      {loading ? (
        <LoadingSkeleton type="profiles" />
      ) : (
        <div ref={scrollRef} className="flex overflow-x-auto gap-4 pb-2" dir="rtl">
          {user && <AddStoryButton className="flex-shrink-0" />}
          {displayProfiles.length > 0 ? (
            displayProfiles.map((profile, index) => {
              const isLast = index === displayProfiles.length - 1;
              return (
                <div
                  key={profile.id}
                  ref={isLast && showPaginated ? lastProfileRef : undefined}
                >
                  <ProfileCard
                    id={profile.id}
                    image={profile.image}
                    name={profile.name}
                    className="flex-shrink-0"
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground col-span-full">אין משתמשים רשומים עדיין</div>
          )}
          {paginatedLoading && showPaginated && (
            <div className="flex-shrink-0">
              <LoadingSkeleton type="profiles" count={3} />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default NeighborsSection;