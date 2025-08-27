import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export interface CouponClaim {
  id: string;
  user_id: string;
  perk_id: string;
  claimed_at: string;
  qr_code_data: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCouponClaim {
  id: string;
  user_id: string;
  user_coupon_id: string;
  qr_code_data: string;
  created_at: string;
}

const fetchUserCouponClaims = async (userId?: string) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('user_coupon_claims')
      .select(`
        *,
        community_perks!inner(
          id,
          business_name,
          title,
          description,
          discount_amount,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user coupon claims:', error);
    return [];
  }
};

const generateUserCouponQR = async ({ userCouponId, userId }: { userCouponId: string; userId: string }) => {
  try {
    // Generate unique QR code data for user coupon
    const qrCodeData = JSON.stringify({
      type: 'user_coupon',
      userCouponId,
      userId,
      generatedAt: new Date().toISOString(),
      uniqueId: crypto.randomUUID()
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating user coupon QR:', error);
    toast({
      title: "Error",
      description: "Failed to generate QR code. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

const claimCoupon = async ({ perkId, userId }: { perkId: string; userId: string }) => {
  try {
    // Generate unique QR code data
    const qrCodeData = JSON.stringify({
      perkId,
      userId,
      claimedAt: new Date().toISOString(),
      uniqueId: crypto.randomUUID()
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Save to database
    const { data, error } = await supabase
      .from('user_coupon_claims')
      .insert({
        user_id: userId,
        perk_id: perkId,
        qr_code_data: qrCodeUrl
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Coupon Claimed!",
      description: "Your QR code has been generated successfully.",
    });

    return data;
  } catch (error) {
    console.error('Error claiming coupon:', error);
    toast({
      title: "Error",
      description: "Failed to claim coupon. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const useCouponClaims = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ['coupon-claims', userId],
    queryFn: () => fetchUserCouponClaims(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const claimMutation = useMutation({
    mutationFn: claimCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon-claims', userId] });
    },
  });

  const generateQRMutation = useMutation({
    mutationFn: generateUserCouponQR,
  });

  const checkIfClaimed = (perkId: string) => {
    return claims?.some(claim => claim.perk_id === perkId) || false;
  };

  const getClaim = (perkId: string) => {
    return claims?.find(claim => claim.perk_id === perkId);
  };

  const handleGenerateUserCouponQR = (userCouponId: string) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to generate QR codes",
        variant: "destructive",
      });
      return;
    }

    return generateQRMutation.mutateAsync({ userCouponId, userId });
  };

  return {
    claims: claims || [],
    loading: isLoading,
    claimCoupon: claimMutation.mutate,
    claiming: claimMutation.isPending,
    checkIfClaimed,
    getClaim,
    generateUserCouponQR: handleGenerateUserCouponQR,
    generatingQR: generateQRMutation.isPending,
  };
};