import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, QrCode, Clock, CheckCircle, User, MapPin } from "lucide-react";
import { useCommunityPerks } from "@/hooks/useCommunityPerks";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { useCouponClaims } from "@/hooks/useCouponClaims";
import { CouponQRModal } from "@/components/CouponQRModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CommunityPerksCarouselProps {
  filter?: 'all' | 'following';
  following?: string[];
}

export const CommunityPerksCarousel = ({ filter = 'all', following = [] }: CommunityPerksCarouselProps) => {
  const { user } = useAuth();
  const { perks, loading: perksLoading } = useCommunityPerks();
  const { coupons, loading: couponsLoading } = useUserCoupons();
  const { claims, claimCoupon, claiming, checkIfClaimed, getClaim, generateUserCouponQR, generatingQR } = useCouponClaims(user?.id);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [selectedUserCoupon, setSelectedUserCoupon] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [currentQRData, setCurrentQRData] = useState<string>('');

  const loading = perksLoading || couponsLoading;

  // Memoize the combined and filtered items to prevent infinite re-renders
  const allItems = useMemo(() => {
    // Combine and sort both community perks and user coupons
    let items = [
      ...perks.map(perk => ({ ...perk, type: 'community_perk' })),
      ...coupons.map(coupon => ({ ...coupon, type: 'user_coupon', business_name: coupon.business_name || coupon.title }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Filter based on following users if filter is 'following'
    if (filter === 'following' && user) {
      items = items.filter(item => {
        // For user coupons, check if the creator is being followed
        if (item.type === 'user_coupon') {
          return (item as any).user_id && following.includes((item as any).user_id);
        }
        // For community perks, keep them all since they don't have specific user creators
        // or check if they have a user_id and if that user is being followed
        return !(item as any).user_id || following.includes((item as any).user_id);
      });
    }

    return items;
  }, [perks, coupons, filter, user, following]);

  const handleClaimCoupon = (perkId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to claim coupons",
        variant: "destructive",
      });
      return;
    }

    claimCoupon({ perkId, userId: user.id });
  };

  const handleShowQR = (perk: any) => {
    const claim = getClaim(perk.id);
    if (claim) {
      setSelectedPerk(perk);
      setSelectedUserCoupon(null);
      setCurrentQRData('');
      setQrModalOpen(true);
    }
  };

  const handleShowUserCouponQR = async (userCoupon: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to generate QR codes",
        variant: "destructive",
      });
      return;
    }

    try {
      const qrData = await generateUserCouponQR(userCoupon.id);
      setSelectedUserCoupon(userCoupon);
      setSelectedPerk(null);
      setCurrentQRData(qrData);
      setQrModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-8 animate-pulse min-w-fit">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="min-w-[240px] w-[240px] flex-shrink-0 aspect-[4/5] bg-gradient-to-br from-muted/30 to-muted/50 rounded-3xl border-0 shadow-lg">
            <div className="w-full h-full bg-muted/40 rounded-3xl animate-pulse"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground w-full">
        <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Gift className="w-10 h-10 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Hot Deals Available</h3>
        <p className="text-sm">Check back later for exciting coupons and offers!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-8 min-w-fit">
        {allItems.map((item) => {
          const isUserCoupon = item.type === 'user_coupon';
          const isClaimed = !isUserCoupon && checkIfClaimed(item.id);
          const claim = !isUserCoupon ? getClaim(item.id) : null;
          
          return (
            <Card key={`${item.type}-${item.id}`} className="min-w-[240px] w-[240px] flex-shrink-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden rounded-3xl hover:scale-[1.02] hover:shadow-primary/20">
              <CardContent className="p-0 space-y-0 relative aspect-[4/5] overflow-hidden rounded-3xl">
                {item.image_url ? (
                  <>
                    {/* Main image - full height like UniformCard */}
                    <img 
                      src={item.image_url} 
                      alt={item.business_name || item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Shimmer overlay on hover - matching UniformCard */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out"></div>
                    
                    {/* Glow border on hover */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary/30 transition-all duration-500"></div>
                    
                    {/* Text overlay at bottom - matching UniformCard style */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 transform translate-y-0 group-hover:translate-y-[-2px] transition-transform duration-300">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-white line-clamp-1 text-base leading-tight drop-shadow-lg">
                          {item.business_name}
                        </h3>
                        <p className="text-xs text-white/80 line-clamp-1 drop-shadow-md">
                          {item.title}
                        </p>
                        
                        {/* Compact info badges - matching UniformCard style */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {item.discount_amount && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-red-500 backdrop-blur-md rounded-full text-white border border-red-500 shadow-lg transition-all duration-300 group-hover:bg-red-600 group-hover:scale-105">
                              {item.discount_amount}
                            </span>
                          )}
                          {((item as any).address || (item as any).neighborhood) && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-primary/90 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg transition-all duration-300 group-hover:bg-primary group-hover:scale-105">
                              <MapPin className="w-2.5 h-2.5 inline mr-1" />
                              {(item as any).address || (item as any).neighborhood}
                            </span>
                          )}
                          {item.valid_until && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-orange-500/90 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg transition-all duration-300 group-hover:bg-orange-500 group-hover:scale-105">
                              <Clock className="w-2.5 h-2.5 inline mr-1" />
                              {new Date(item.valid_until).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        
                        {/* Action Button - small and integrated */}
                        <div className="pt-1">
                          {isUserCoupon ? (
                            <Button
                              onClick={() => handleShowUserCouponQR(item)}
                              disabled={generatingQR}
                              className="w-full h-6 bg-white/20 hover:bg-white/30 text-white font-medium text-xs rounded-lg backdrop-blur-md border border-white/30 transition-all duration-200"
                            >
                              <QrCode className="w-2.5 h-2.5 mr-1" />
                              {generatingQR ? 'Loading...' : 'Show QR'}
                            </Button>
                          ) : isClaimed ? (
                            <Button
                              onClick={() => handleShowQR(item)}
                              className={`w-full h-6 font-medium text-xs rounded-lg backdrop-blur-md transition-all duration-200 ${
                                claim?.is_used 
                                  ? 'bg-gray-500/20 text-white/60 cursor-default border border-white/20' 
                                  : 'bg-green-500/20 hover:bg-green-500/30 text-white border border-white/30'
                              }`}
                              disabled={claim?.is_used}
                            >
                              {claim?.is_used ? (
                                <>
                                  <CheckCircle className="w-2.5 h-2.5 mr-1" />
                                  Used
                                </>
                              ) : (
                                <>
                                  <QrCode className="w-2.5 h-2.5 mr-1" />
                                  Show QR
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleClaimCoupon(item.id)}
                              disabled={claiming}
                              className="w-full h-6 bg-coral/20 hover:bg-coral/30 text-white font-medium text-xs rounded-lg backdrop-blur-md border border-white/30 transition-all duration-200"
                            >
                              <Gift className="w-2.5 h-2.5 mr-1" />
                              {claiming ? 'Claiming...' : 'Claim'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No Image - Fallback design matching UniformCard style */
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex flex-col justify-center items-center p-4 relative border border-primary/10 rounded-3xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-3 shadow-lg border border-primary/20">
                      <Gift className="w-8 h-8 text-primary drop-shadow-sm" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 text-center line-clamp-2">
                      {item.business_name}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-3">
                      {item.title}
                    </p>
                    
                    {/* Badges for no-image version */}
                    {item.discount_amount && (
                      <div className="mb-3">
                        <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md">
                          {item.discount_amount}
                        </span>
                      </div>
                    )}
                    
                    {/* Compact action button */}
                    {isUserCoupon ? (
                      <Button
                        onClick={() => handleShowUserCouponQR(item)}
                        disabled={generatingQR}
                        className="w-full h-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs rounded-lg shadow-sm transition-all duration-200"
                      >
                        <QrCode className="w-2.5 h-2.5 mr-1" />
                        {generatingQR ? 'Loading...' : 'Show QR'}
                      </Button>
                    ) : isClaimed ? (
                      <Button
                        onClick={() => handleShowQR(item)}
                        className={`w-full h-6 font-medium text-xs rounded-lg shadow-sm transition-all duration-200 ${
                          claim?.is_used 
                            ? 'bg-muted text-muted-foreground cursor-default' 
                            : 'bg-green-500 hover:bg-green-500/90 text-white'
                        }`}
                        disabled={claim?.is_used}
                      >
                        {claim?.is_used ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5 mr-1" />
                            Used
                          </>
                        ) : (
                          <>
                            <QrCode className="w-2.5 h-2.5 mr-1" />
                            Show QR
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleClaimCoupon(item.id)}
                        disabled={claiming}
                        className="w-full h-6 bg-coral hover:bg-coral/90 text-white font-medium text-xs rounded-lg shadow-sm transition-all duration-200"
                      >
                        <Gift className="w-2.5 h-2.5 mr-1" />
                        {claiming ? 'Claiming...' : 'Claim'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CouponQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        perk={selectedPerk}
        userCoupon={selectedUserCoupon}
        claim={selectedPerk ? getClaim(selectedPerk.id) : null}
        qrCodeData={currentQRData}
      />
    </>
  );
};