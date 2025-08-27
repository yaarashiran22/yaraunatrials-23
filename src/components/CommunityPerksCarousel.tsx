import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, QrCode, Clock, CheckCircle } from "lucide-react";
import { useCommunityPerks } from "@/hooks/useCommunityPerks";
import { useCouponClaims } from "@/hooks/useCouponClaims";
import { CouponQRModal } from "@/components/CouponQRModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const CommunityPerksCarousel = () => {
  const { user } = useAuth();
  const { perks, loading } = useCommunityPerks();
  const { claims, claimCoupon, claiming, checkIfClaimed, getClaim } = useCouponClaims(user?.id);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

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
      setQrModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-5 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="min-w-[280px] h-[200px] bg-muted/50" />
        ))}
      </div>
    );
  }

  if (perks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground w-full">
        <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No coupons available at the moment</p>
      </div>
    );
  }

  return (
    <>
      {perks.map((perk) => {
        const isClaimed = checkIfClaimed(perk.id);
        const claim = getClaim(perk.id);
        
        return (
          <Card key={perk.id} className="min-w-[280px] bg-gradient-to-br from-background to-muted/20 border border-border/50 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {perk.business_name}
                  </h3>
                  <p className="text-xs text-primary font-medium mt-1">
                    {perk.title}
                  </p>
                </div>
                {perk.image_url && (
                  <img 
                    src={perk.image_url} 
                    alt={perk.business_name}
                    className="w-12 h-12 rounded-lg object-cover border border-border/20"
                  />
                )}
              </div>

              {/* Discount */}
              {perk.discount_amount && (
                <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                  {perk.discount_amount}
                </Badge>
              )}

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {perk.description}
              </p>

              {/* Valid Until */}
              {perk.valid_until && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Valid until {new Date(perk.valid_until).toLocaleDateString()}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {isClaimed ? (
                  <Button
                    onClick={() => handleShowQR(perk)}
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
                    onClick={() => handleClaimCoupon(perk.id)}
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

      <CouponQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        perk={selectedPerk}
        claim={selectedPerk ? getClaim(selectedPerk.id) : null}
      />
    </>
  );
};