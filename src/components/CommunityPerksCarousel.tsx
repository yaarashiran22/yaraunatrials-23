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
            <Card key={`${item.type}-${item.id}`} className="min-w-[240px] w-[240px] flex-shrink-0 bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden rounded-3xl">
              <CardContent className="p-0 space-y-0 relative aspect-[4/5] overflow-hidden rounded-3xl">
                {item.image_url ? (
                  <>
                    <img 
                      src={item.image_url} 
                      alt={item.business_name || item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Shimmer overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out"></div>
                    
                    {/* Discount Badge - Floating */}
                    {item.discount_amount && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground font-bold text-xs px-3 py-1 rounded-2xl shadow-lg border-0">
                          {item.discount_amount}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Content overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 transform translate-y-0 group-hover:translate-y-[-2px] transition-transform duration-300">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-white line-clamp-1 text-base leading-tight drop-shadow-lg">
                          {item.business_name}
                        </h3>
                        <p className="text-xs text-white/80 line-clamp-1 drop-shadow-md">
                          {item.title}
                        </p>
                        
                        {/* Compact info row */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {((item as any).address || (item as any).neighborhood) && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-primary/90 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {(item as any).address || (item as any).neighborhood}
                            </span>
                          )}
                          {item.valid_until && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-red-500/90 backdrop-blur-md rounded-full text-white border border-white/40 shadow-lg">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(item.valid_until).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        
                        {/* Action Button - Compact */}
                        <div className="pt-2">
                          {isUserCoupon ? (
                            <Button
                              onClick={() => handleShowUserCouponQR(item)}
                              disabled={generatingQR}
                              className="w-full h-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <QrCode className="w-3 h-3 mr-1" />
                              {generatingQR ? 'Generating...' : 'Show QR'}
                            </Button>
                          ) : isClaimed ? (
                            <Button
                              onClick={() => handleShowQR(item)}
                              className={`w-full h-8 font-medium text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                                claim?.is_used 
                                  ? 'bg-gray-500 hover:bg-gray-600 text-white cursor-default transform-none' 
                                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                              }`}
                              disabled={claim?.is_used}
                            >
                              {claim?.is_used ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Used
                                </>
                              ) : (
                                <>
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Show QR
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleClaimCoupon(item.id)}
                              disabled={claiming}
                              className="w-full h-8 bg-gradient-to-r from-coral to-coral-hover hover:from-coral-hover hover:to-coral text-white font-medium text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              {claiming ? 'Claiming...' : 'Claim'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No Image - Fallback design */
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col justify-center items-center p-4 relative">
                    {/* Discount Badge */}
                    {item.discount_amount && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground font-bold text-xs px-3 py-1 rounded-2xl shadow-md border-0">
                          {item.discount_amount}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-3">
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm leading-tight mb-1 text-center line-clamp-2">
                      {item.business_name}
                    </h3>
                    <p className="text-xs text-primary font-semibold text-center line-clamp-2 mb-3">
                      {item.title}
                    </p>
                    
                    {/* Compact action button */}
                    {isUserCoupon ? (
                      <Button
                        onClick={() => handleShowUserCouponQR(item)}
                        disabled={generatingQR}
                        className="w-full h-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        {generatingQR ? 'Generating...' : 'Show QR'}
                      </Button>
                    ) : isClaimed ? (
                      <Button
                        onClick={() => handleShowQR(item)}
                        className={`w-full h-8 font-medium text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                          claim?.is_used 
                            ? 'bg-gray-500 hover:bg-gray-600 text-white cursor-default transform-none' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                        }`}
                        disabled={claim?.is_used}
                      >
                        {claim?.is_used ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Used
                          </>
                        ) : (
                          <>
                            <QrCode className="w-3 h-3 mr-1" />
                            Show QR
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleClaimCoupon(item.id)}
                        disabled={claiming}
                        className="w-full h-8 bg-gradient-to-r from-coral to-coral-hover hover:from-coral-hover hover:to-coral text-white font-medium text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <Gift className="w-3 h-3 mr-1" />
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