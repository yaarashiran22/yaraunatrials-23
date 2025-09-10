import { useState } from "react";
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

  // Debug logging
  console.log('CommunityPerksCarousel - Filter:', filter);
  console.log('CommunityPerksCarousel - Perks:', perks.length);
  console.log('CommunityPerksCarousel - Coupons:', coupons.length);
  console.log('CommunityPerksCarousel - Following:', following.length);
  console.log('CommunityPerksCarousel - Loading:', loading);
  
  // Combine and sort both community perks and user coupons
  let allItems = [
    ...perks.map(perk => ({ ...perk, type: 'community_perk' })),
    ...coupons.map(coupon => ({ ...coupon, type: 'user_coupon', business_name: coupon.business_name || coupon.title }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter based on following users if filter is 'following'
  if (filter === 'following' && user) {
    allItems = allItems.filter(item => {
      // For user coupons, check if the creator is being followed
      if (item.type === 'user_coupon') {
        return (item as any).user_id && following.includes((item as any).user_id);
      }
      // For community perks, keep them all since they don't have specific user creators
      // or check if they have a user_id and if that user is being followed
      return !(item as any).user_id || following.includes((item as any).user_id);
    });
  }

  console.log('CommunityPerksCarousel - Final allItems after filtering:', allItems.length);
  console.log('CommunityPerksCarousel - Items:', allItems);

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
      <div className="flex gap-5 animate-pulse min-w-fit">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="min-w-[280px] flex-shrink-0 h-[200px] bg-muted/50" />
        ))}
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground w-full">
        <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No coupons available at the moment</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-5 min-w-fit">
        {allItems.map((item) => {
          const isUserCoupon = item.type === 'user_coupon';
          const isClaimed = !isUserCoupon && checkIfClaimed(item.id);
          const claim = !isUserCoupon ? getClaim(item.id) : null;
          
          return (
            <Card key={`${item.type}-${item.id}`} className="min-w-[280px] flex-shrink-0 bg-gradient-to-br from-background to-muted/20 border border-border/50 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-4 space-y-3 bg-card/80 border border-border/20 rounded-lg backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {item.business_name}
                      </h3>
                    </div>
                    <p className="text-xs text-primary font-medium mt-1">
                      {item.title}
                    </p>
                  </div>
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.business_name || item.title}
                      className="w-20 h-20 rounded-lg object-cover border border-border/20"
                    />
                  )}
                </div>

                {/* Discount */}
                {item.discount_amount && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                    {item.discount_amount}
                  </Badge>
                )}

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Location and Valid Until */}
                <div className="space-y-1">
                  {(item as any).neighborhood && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{(item as any).neighborhood}</span>
                    </div>
                  )}
                  {item.valid_until && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Valid until {new Date(item.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {isUserCoupon ? (
                    <Button
                      onClick={() => handleShowUserCouponQR(item)}
                      disabled={generatingQR}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <QrCode className="w-4 h-4" />
                      {generatingQR ? 'Generating...' : 'Show QR Code'}
                    </Button>
                  ) : isClaimed ? (
                    <Button
                      onClick={() => handleShowQR(item)}
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {claim?.is_used ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Used
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4" />
                          Show QR Code
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleClaimCoupon(item.id)}
                      disabled={claiming}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Gift className="w-4 h-4" />
                      {claiming ? 'Claiming...' : 'Claim Coupon'}
                    </Button>
                  )}
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