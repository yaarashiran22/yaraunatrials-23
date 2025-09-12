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
          <Card key={i} className="min-w-[240px] w-[240px] flex-shrink-0 h-[360px] bg-gradient-to-br from-muted/30 to-muted/50 rounded-3xl border-0 shadow-lg">
            <div className="h-44 bg-muted/40 rounded-t-3xl"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-muted/40 rounded-full w-3/4"></div>
              <div className="h-3 bg-muted/30 rounded-full w-full"></div>
              <div className="h-3 bg-muted/30 rounded-full w-2/3"></div>
              <div className="h-12 bg-muted/40 rounded-2xl mt-6"></div>
            </div>
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
            <Card key={`${item.type}-${item.id}`} className="min-w-[240px] w-[240px] flex-shrink-0 bg-gradient-to-br from-card to-card/95 border-0 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group overflow-hidden rounded-2xl">
              <CardContent className="p-0 space-y-0 relative">
                {/* Header Image Section - Much Larger */}
                {item.image_url ? (
                  <div className="relative overflow-hidden h-64">
                    <img 
                      src={item.image_url} 
                      alt={item.business_name || item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Discount Badge - Modern floating */}
                    {item.discount_amount && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-warning/95 backdrop-blur-sm hover:bg-warning text-warning-foreground font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border-0">
                          {item.discount_amount}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Business Name and Title Overlay - Minimal */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-white text-base leading-tight drop-shadow-md mb-1">
                        {item.business_name}
                      </h3>
                      <p className="text-xs text-white/90 font-medium drop-shadow-sm line-clamp-1">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* No Image Header - Much Larger */
                  <div className="p-4 pb-3 bg-gradient-to-br from-primary/5 to-secondary/5 h-64 flex flex-col justify-center relative">
                    {/* Discount Badge - Top Right */}
                    {item.discount_amount && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-warning/95 backdrop-blur-sm hover:bg-warning text-warning-foreground font-bold text-xs px-3 py-1.5 rounded-full shadow-md border-0">
                          {item.discount_amount}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground text-base leading-tight mb-1">
                        {item.business_name}
                      </h3>
                      <p className="text-sm text-primary font-semibold">
                        {item.title}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Content Section - Compact */}
                <div className="p-4 space-y-3">
                  {/* Description - Shortened */}
                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Location and Valid Until Info - Compact */}
                  <div className="space-y-1.5">
                    {(item as any).address && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-6 h-6 bg-muted/40 rounded-full flex items-center justify-center">
                          <MapPin className="w-3 h-3" />
                        </div>
                        <span className="font-medium truncate">{(item as any).address}</span>
                      </div>
                    )}
                    {(item as any).neighborhood && !(item as any).address && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-6 h-6 bg-muted/40 rounded-full flex items-center justify-center">
                          <MapPin className="w-3 h-3" />
                        </div>
                        <span className="font-medium truncate">{(item as any).neighborhood}</span>
                      </div>
                    )}
                    {item.valid_until && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-6 h-6 bg-muted/40 rounded-full flex items-center justify-center">
                          <Clock className="w-3 h-3" />
                        </div>
                        <span className="font-medium">
                          Valid until {new Date(item.valid_until).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button - Modern */}
                  <div className="pt-1">
                    {isUserCoupon ? (
                      <Button
                        onClick={() => handleShowUserCouponQR(item)}
                        disabled={generatingQR}
                        className="w-full h-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {generatingQR ? 'Generating...' : 'Show QR'}
                      </Button>
                    ) : isClaimed ? (
                      <Button
                        onClick={() => handleShowQR(item)}
                        className={`w-full h-10 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] ${
                          claim?.is_used 
                            ? 'bg-gray-500 hover:bg-gray-600 text-white cursor-default transform-none' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                        }`}
                        disabled={claim?.is_used}
                      >
                        {claim?.is_used ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Used
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Show QR
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleClaimCoupon(item.id)}
                        disabled={claiming}
                        className="w-full h-10 bg-gradient-to-r from-coral to-coral-hover hover:from-coral-hover hover:to-coral text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {claiming ? 'Claiming...' : 'Claim Coupon'}
                      </Button>
                    )}
                  </div>
                </div>
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