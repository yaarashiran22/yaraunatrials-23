import { Calendar, MapPin, Users, Trash2, Pencil, Edit, X, Star, Heart, MessageCircle, Share2, Bell, ChevronLeft, ChevronRight, Play, Pause, Instagram, Settings, Gift, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserMessages } from "@/hooks/useUserMessages";
import { validateUUID, canUserModifyItem } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import NotificationsPopup from "@/components/NotificationsPopup";
import { useUserEvents } from "@/hooks/useUserEvents";
import { InstagramStoryPopup } from "@/components/InstagramStoryPopup";
import { useFriends } from "@/hooks/useFriends";
import { useFollowing } from "@/hooks/useFollowing";
import { useProfile } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/useUserPosts";
import { getRelativeDay } from "@/utils/dateUtils";
import SectionHeader from "@/components/SectionHeader";
import UniformCard from "@/components/UniformCard";
import ProfilePictureViewer from "@/components/ProfilePictureViewer";
import { FeedImageViewer } from "@/components/FeedImageViewer";
import EditEventPopup from "@/components/EditEventPopup";
import { EditCouponModal } from "@/components/EditCouponModal";
import { supabase } from "@/integrations/supabase/client";

import { useMyCoupons } from "@/hooks/useUserCoupons";

import profile1 from "@/assets/profile-1.jpg";
import communityEvent from "@/assets/community-event.jpg";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, requireAuth, canAccessResource } = useSecureAuth();
  const { toast } = useToast();
  
  // Use security utility for UUID validation
  
  // Handle profile ID logic: if no ID or invalid ID, use current user's profile
  const getActualProfileId = () => {
    if (!id || !validateUUID(id)) {
      return user?.id;
    }
    return id;
  };
  
  const actualProfileId = getActualProfileId();
  const { profile: profileData, loading, error, refetch } = useProfile(actualProfileId);
  const { events: userEvents, loading: eventsLoading, deleteEvent, refetch: refetchEvents } = useUserEvents(actualProfileId);
  const { imagePosts, loading: postsLoading } = useUserPosts(actualProfileId);
  const { addFriend, isFriend } = useFriends();
  const { isFollowing, toggleFollow, isToggling } = useFollowing();
  const { myCoupons, loading: couponsLoading, deleteCoupon, deleting: deletingCoupon, refreshCoupons } = useMyCoupons(user?.id);
  const { messages, loading: messagesLoading, creating: creatingMessage, updating: updatingMessage, createMessage, updateMessage, deleteMessage } = useUserMessages(actualProfileId);
  
  // Check if this is the current user's profile
  // If the ID is invalid or missing, we're showing the current user's profile
  const isOwnProfile = user && (!id || !validateUUID(id) || actualProfileId === user.id);

  console.log('ProfilePage - Debug info:', {
    urlId: id,
    actualProfileId,
    currentUserId: user?.id,
    isOwnProfile,
    isValidUUID: id ? validateUUID(id) : false
  });
  
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [generatedStoryUrl, setGeneratedStoryUrl] = useState<string | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [currentEventTitle, setCurrentEventTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [showFeedImages, setShowFeedImages] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<any>(null);
  const [showEditCoupon, setShowEditCoupon] = useState(false);
  const [selectedCouponForEdit, setSelectedCouponForEdit] = useState<any>(null);

  // Function to extract dominant colors from an image
  const extractImageColors = (img: HTMLImageElement): { primary: string; secondary: string } => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Use smaller canvas for color sampling for performance
    const sampleSize = 50;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;
    
    const colorCounts: { [key: string]: number } = {};
    
    // Sample colors from the image
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      // Skip transparent pixels
      if (alpha < 128) continue;
      
      // Group similar colors together (reduce precision)
      const rGroup = Math.floor(r / 32) * 32;
      const gGroup = Math.floor(g / 32) * 32;
      const bGroup = Math.floor(b / 32) * 32;
      
      const colorKey = `${rGroup},${gGroup},${bGroup}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    // Get the most common colors
    const sortedColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (sortedColors.length === 0) {
      // Fallback to default colors
      return { primary: '#3B82F6', secondary: '#8B5CF6' };
    }
    
    const [r1, g1, b1] = sortedColors[0][0].split(',').map(Number);
    const primary = `rgb(${r1}, ${g1}, ${b1})`;
    
    let secondary = primary;
    if (sortedColors.length > 1) {
      const [r2, g2, b2] = sortedColors[1][0].split(',').map(Number);
      secondary = `rgb(${r2}, ${g2}, ${b2})`;
    } else {
      // Create a complementary color if only one dominant color
      const hsl = rgbToHsl(r1, g1, b1);
      const compHue = (hsl.h + 180) % 360;
      secondary = `hsl(${compHue}, ${hsl.s}%, ${Math.max(30, hsl.l - 20)}%)`;
    }
    
    return { primary, secondary };
  };

  // Helper function to convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const generateInstagramStory = async (eventData: any) => {
    setGeneratingStory(true);
    setCurrentEventTitle(eventData.title);
    setShowStoryPopup(true);
    
    try {
      // Create story prompt based on event data
      const eventDate = eventData.date ? `Date: ${eventData.date}` : '';
      const eventTime = eventData.time ? `Time: ${eventData.time}` : '';
      const eventLocation = eventData.location ? `Location: ${eventData.location}` : '';
      const eventPrice = eventData.price ? `Price: ${eventData.price}` : 'Free Entry';
      
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      
      // Default gradient colors
      let primaryColor = '#3B82F6'; // blue
      let secondaryColor = '#8B5CF6'; // purple
      
      // Load and add event image if available, and extract colors
      let eventImageElement: HTMLImageElement | null = null;
      if (eventData.image_url || eventData.video_url) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = eventData.image_url || eventData.video_url;
          });
          
          eventImageElement = img;
          
          // Extract colors from the image
          const extractedColors = extractImageColors(img);
          primaryColor = extractedColors.primary;
          secondaryColor = extractedColors.secondary;
          
        } catch (error) {
          console.warn('Failed to load event image for color extraction:', error);
        }
      }
      
      // Create gradient background using extracted or default colors
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the event image if loaded
      if (eventImageElement) {
        try {
          // Calculate image dimensions to fit in larger upper portion of story
          const imageHeight = 1100; // Larger upper portion height (was 800)
          const imageWidth = canvas.width;
          const aspectRatio = eventImageElement.width / eventImageElement.height;
          
          let drawWidth = imageWidth;
          let drawHeight = imageWidth / aspectRatio;
          
          if (drawHeight > imageHeight) {
            drawHeight = imageHeight;
            drawWidth = imageHeight * aspectRatio;
          }
          
          const x = (canvas.width - drawWidth) / 2;
          const y = 50; // Reduced margin for larger image (was 100)
          
          // Draw image with rounded corners effect
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, drawWidth, drawHeight, 20);
          ctx.clip();
          ctx.drawImage(eventImageElement, x, y, drawWidth, drawHeight);
          ctx.restore();
          
          // Add semi-transparent overlay for text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, y + drawHeight - 200, canvas.width, 200);
        } catch (error) {
          console.warn('Failed to draw event image:', error);
        }
      }
      
      // Add user profile image and name
      if (profileData?.profile_image_url || profileData?.name) {
        // Add user profile circle at bottom left
        const profileCircleX = 120;
        const profileCircleY = canvas.height - 120;
        const profileCircleRadius = 50;
        
        // Draw profile circle background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(profileCircleX, profileCircleY, profileCircleRadius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        if (profileData.profile_image_url) {
          try {
            const profileImg = new Image();
            profileImg.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              profileImg.onload = resolve;
              profileImg.onerror = reject;
              profileImg.src = profileData.profile_image_url;
            });
            
            // Draw circular profile image
            ctx.save();
            ctx.beginPath();
            ctx.arc(profileCircleX, profileCircleY, profileCircleRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(profileImg, 
              profileCircleX - profileCircleRadius, 
              profileCircleY - profileCircleRadius, 
              profileCircleRadius * 2, 
              profileCircleRadius * 2
            );
            ctx.restore();
          } catch (error) {
            console.warn('Failed to load profile image:', error);
            // Fallback to initials if profile image fails
            if (profileData.name) {
              ctx.fillStyle = '#3B82F6';
              ctx.beginPath();
              ctx.arc(profileCircleX, profileCircleY, profileCircleRadius, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = 'white';
              ctx.font = 'bold 32px Poppins, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(profileData.name.charAt(0).toUpperCase(), profileCircleX, profileCircleY + 10);
            }
          }
        } else if (profileData.name) {
          // Draw initials circle
          ctx.fillStyle = '#3B82F6';
          ctx.beginPath();
          ctx.arc(profileCircleX, profileCircleY, profileCircleRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 32px Poppins, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(profileData.name.charAt(0).toUpperCase(), profileCircleX, profileCircleY + 10);
        }
        
        // Add user name next to profile circle
        if (profileData.name) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 28px Nunito, sans-serif';
          ctx.textAlign = 'left';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.lineWidth = 2;
          ctx.strokeText(`Organized by ${profileData.name}`, profileCircleX + profileCircleRadius + 20, profileCircleY + 8);
          ctx.fillText(`Organized by ${profileData.name}`, profileCircleX + profileCircleRadius + 20, profileCircleY + 8);
        }
      }
      
      
      // Add modern geometric decorations
      ctx.save();
      ctx.globalAlpha = 0.1;
      
      // Add floating geometric shapes
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 40 + 20;
        
        if (i % 3 === 0) {
          // Circles
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (i % 3 === 1) {
          // Triangles
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x - size, y + size);
          ctx.lineTo(x + size, y + size);
          ctx.closePath();
          ctx.fill();
        } else {
          // Rectangles
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(x - size/2, y - size/2, size, size);
        }
      }
      ctx.restore();

      // Add glassmorphism info cards
      const cardWidth = 900;
      const cardHeight = 450;
      const cardX = (canvas.width - cardWidth) / 2;
      const cardY = 1200;
      
      // Card background with glassmorphism
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.filter = 'blur(0.5px)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 25);
      ctx.fill();
      
      // Card border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Title with modern gradient effect
      const titleY = eventData.image_url || eventData.video_url ? 1000 : 500;
      ctx.save();
      
      // Create gradient for title
      const titleGradient = ctx.createLinearGradient(0, titleY - 50, 0, titleY + 50);
      titleGradient.addColorStop(0, '#FFFFFF');
      titleGradient.addColorStop(1, '#E0E0E0');
      
      ctx.fillStyle = titleGradient;
      ctx.font = 'bold 75px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      
      const titleWords = eventData.title.split(' ');
      let currentTitleY = titleY;
      for (let i = 0; i < titleWords.length; i += 2) {
        const line = titleWords.slice(i, i + 2).join(' ');
        ctx.strokeText(line, canvas.width / 2, currentTitleY);
        ctx.fillText(line, canvas.width / 2, currentTitleY);
        currentTitleY += 85;
      }
      ctx.restore();
      
      // Modern icon-style info display
      const infoY = cardY + 80;
      const iconSize = 35;
      const textOffsetX = 60;
      
      ctx.font = '42px Nunito, sans-serif';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      
      let currentInfoY = infoY;
      
      // Draw modern calendar icon and date
      if (eventData.date) {
        ctx.save();
        // Calendar icon (simplified geometric)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(canvas.width / 2 - 220, currentInfoY - iconSize/2, iconSize, iconSize);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 220, currentInfoY - iconSize/2, iconSize, iconSize);
        
        // Calendar details
        ctx.fillStyle = primaryColor;
        ctx.fillRect(canvas.width / 2 - 220, currentInfoY - iconSize/2, iconSize, 8);
        
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeText(eventData.date, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        ctx.fillText(eventData.date, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        currentInfoY += 75;
      }
      
      // Draw modern clock icon and time
      if (eventData.time) {
        ctx.save();
        // Clock icon (circle with hands)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 202, currentInfoY - 5, iconSize/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Clock hands
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 202, currentInfoY - 5);
        ctx.lineTo(canvas.width / 2 - 202, currentInfoY - 20);
        ctx.moveTo(canvas.width / 2 - 202, currentInfoY - 5);
        ctx.lineTo(canvas.width / 2 - 190, currentInfoY - 5);
        ctx.stroke();
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeText(eventData.time, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        ctx.fillText(eventData.time, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        currentInfoY += 75;
      }
      
      // Draw modern location pin icon
      if (eventData.location) {
        ctx.save();
        // Location pin (teardrop shape)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 202, currentInfoY - 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 202, currentInfoY - 3);
        ctx.lineTo(canvas.width / 2 - 195, currentInfoY + 10);
        ctx.lineTo(canvas.width / 2 - 209, currentInfoY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeText(eventData.location, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        ctx.fillText(eventData.location, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        currentInfoY += 75;
      }
      
      // Draw modern price tag or free badge
      if (eventData.price) {
        ctx.save();
        // Price tag icon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 220, currentInfoY - iconSize/2, iconSize, iconSize, 5);
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dollar sign
        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', canvas.width / 2 - 202, currentInfoY + 6);
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.font = '42px Nunito, sans-serif';
        ctx.textAlign = 'left';
        ctx.strokeText(eventData.price, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        ctx.fillText(eventData.price, canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
      } else {
        ctx.save();
        // Free badge (star shape)
        ctx.fillStyle = '#FFD700';
        const starX = canvas.width / 2 - 202;
        const starY = currentInfoY - 5;
        ctx.beginPath();
        ctx.moveTo(starX, starY - 15);
        ctx.lineTo(starX + 5, starY - 5);
        ctx.lineTo(starX + 15, starY - 5);
        ctx.lineTo(starX + 8, starY + 3);
        ctx.lineTo(starX + 12, starY + 15);
        ctx.lineTo(starX, starY + 8);
        ctx.lineTo(starX - 12, starY + 15);
        ctx.lineTo(starX - 8, starY + 3);
        ctx.lineTo(starX - 15, starY - 5);
        ctx.lineTo(starX - 5, starY - 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 42px Nunito, sans-serif';
        ctx.textAlign = 'left';
        ctx.strokeText('FREE ENTRY', canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
        ctx.fillText('FREE ENTRY', canvas.width / 2 - 220 + textOffsetX, currentInfoY + 8);
      }
      
      // Modern call to action with neon effect
      ctx.save();
      ctx.font = 'bold 58px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      
      // Neon glow effect
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FFD700';
      ctx.fillText('JOIN THE EVENT!', canvas.width / 2, canvas.height - 180);
      
      // Add border text effect
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeText('JOIN THE EVENT!', canvas.width / 2, canvas.height - 180);
      ctx.restore();
      
      // Convert canvas to blob URL
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      const storyUrl = URL.createObjectURL(blob);
      setGeneratedStoryUrl(storyUrl);
      
    } catch (error) {
      console.error('Error generating Instagram story:', error);
      toast({
        title: "Story Generation Failed",
        description: "Failed to generate Instagram story. Please try again.",
        variant: "destructive",
      });
      setShowStoryPopup(false);
    } finally {
      setGeneratingStory(false);
    }
  };

  const generateCouponInstagramStory = async (couponData: any) => {
    setGeneratingStory(true);
    setCurrentEventTitle(couponData.title);
    setShowStoryPopup(true);
    
    try {
      // Create canvas for coupon story
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      
      // Default gradient colors
      let primaryColor = '#8B5CF6'; // purple
      let secondaryColor = '#EC4899'; // pink
      
      // Load and add coupon image if available, and extract colors
      let couponImageElement: HTMLImageElement | null = null;
      if (couponData.image_url) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = couponData.image_url;
          });
          
          couponImageElement = img;
          
          // Extract colors from the image
          const extractedColors = extractImageColors(img);
          primaryColor = extractedColors.primary;
          secondaryColor = extractedColors.secondary;
          
        } catch (error) {
          console.warn('Failed to load coupon image for color extraction:', error);
        }
      }
      
      // Create gradient background using extracted or default colors
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the coupon image if loaded
      if (couponImageElement) {
        try {
          // Calculate image dimensions to fit in larger upper portion of story
          const imageHeight = 900; // Larger upper portion height (was 700)
          const imageWidth = canvas.width;
          const aspectRatio = couponImageElement.width / couponImageElement.height;
          
          let drawWidth = imageWidth;
          let drawHeight = imageWidth / aspectRatio;
          
          if (drawHeight > imageHeight) {
            drawHeight = imageHeight;
            drawWidth = imageHeight * aspectRatio;
          }
          
          const x = (canvas.width - drawWidth) / 2;
          const y = 100; // Reduced margin for larger image (was 150)
          
          // Draw image with rounded corners effect
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, drawWidth, drawHeight, 20);
          ctx.clip();
          ctx.drawImage(couponImageElement, x, y, drawWidth, drawHeight);
          ctx.restore();
          
          // Add semi-transparent overlay for text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, y + drawHeight - 150, canvas.width, 150);
        } catch (error) {
          console.warn('Failed to draw coupon image:', error);
        }
      }
      
      // Add user profile image and name
      if (profileData?.profile_image_url || profileData?.name) {
        // Add user profile circle at bottom left
        const profileCircleX = 120;
        const profileCircleY = canvas.height - 120;
        const profileCircleRadius = 50;
        
        // Draw profile circle background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(profileCircleX, profileCircleY, profileCircleRadius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        if (profileData.profile_image_url) {
          try {
            const profileImg = new Image();
            profileImg.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              profileImg.onload = resolve;
              profileImg.onerror = reject;
              profileImg.src = profileData.profile_image_url;
            });
            
            // Draw circular profile image
            ctx.save();
            ctx.beginPath();
            ctx.arc(profileCircleX, profileCircleY, profileCircleRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(profileImg, 
              profileCircleX - profileCircleRadius, 
              profileCircleY - profileCircleRadius, 
              profileCircleRadius * 2, 
              profileCircleRadius * 2
            );
            ctx.restore();
          } catch (error) {
            console.warn('Failed to load profile image:', error);
            // Fallback to initials if profile image fails
            if (profileData.name) {
              ctx.fillStyle = '#8B5CF6';
              ctx.beginPath();
              ctx.arc(profileCircleX, profileCircleY, profileCircleRadius, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = 'white';
              ctx.font = 'bold 32px Poppins, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(profileData.name.charAt(0).toUpperCase(), profileCircleX, profileCircleY + 10);
            }
          }
        } else if (profileData.name) {
          // Draw initials circle
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.arc(profileCircleX, profileCircleY, profileCircleRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 32px Poppins, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(profileData.name.charAt(0).toUpperCase(), profileCircleX, profileCircleY + 10);
        }
        
        // Add user name next to profile circle
        if (profileData.name) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 28px Nunito, sans-serif';
          ctx.textAlign = 'left';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.lineWidth = 2;
          ctx.strokeText(`Posted by ${profileData.name}`, profileCircleX + profileCircleRadius + 20, profileCircleY + 8);
          ctx.fillText(`Posted by ${profileData.name}`, profileCircleX + profileCircleRadius + 20, profileCircleY + 8);
        }
      }
      
      
      // Add modern floating elements
      ctx.save();
      ctx.globalAlpha = 0.12;
      
      // Create dynamic floating shapes
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 35 + 15;
        
        ctx.fillStyle = i % 2 === 0 ? 'white' : primaryColor;
        
        if (i % 4 === 0) {
          // Hexagons
          ctx.beginPath();
          for (let j = 0; j < 6; j++) {
            const angle = (j * Math.PI) / 3;
            const hexX = x + size * Math.cos(angle);
            const hexY = y + size * Math.sin(angle);
            if (j === 0) ctx.moveTo(hexX, hexY);
            else ctx.lineTo(hexX, hexY);
          }
          ctx.closePath();
          ctx.fill();
        } else if (i % 4 === 1) {
          // Diamonds
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size);
          ctx.lineTo(x - size, y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Circles
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Modern coupon card design
      const cardWidth = 920;
      const cardHeight = 500;
      const cardX = (canvas.width - cardWidth) / 2;
      const cardY = 1150;
      
      // Coupon card with gradient and glassmorphism
      ctx.save();
      const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
      cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = cardGradient;
      
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 30);
      ctx.fill();
      
      // Coupon border with dashed effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Title with modern typography
      const titleY = couponData.image_url ? 800 : 350;
      ctx.save();
      
      const titleGradient = ctx.createLinearGradient(0, titleY - 60, 0, titleY + 60);
      titleGradient.addColorStop(0, '#FFFFFF');
      titleGradient.addColorStop(1, '#D0D0D0');
      
      ctx.fillStyle = titleGradient;
      ctx.font = 'bold 82px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      
      const titleWords = couponData.title.split(' ');
      let currentTitleY = titleY;
      for (let i = 0; i < titleWords.length; i += 2) {
        const line = titleWords.slice(i, i + 2).join(' ');
        ctx.strokeText(line, canvas.width / 2, currentTitleY);
        ctx.fillText(line, canvas.width / 2, currentTitleY);
        currentTitleY += 95;
      }
      ctx.restore();
      
      // Prominent discount badge
      if (couponData.discount_amount) {
        ctx.save();
        
        // Discount circle background
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, currentTitleY + 100, 85, 0, Math.PI * 2);
        ctx.fill();
        
        // Discount circle border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Discount text with glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 95px Montserrat, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(couponData.discount_amount, canvas.width / 2, currentTitleY + 115);
        
        ctx.restore();
        currentTitleY += 220;
      }
      
      // Modern info display with geometric icons
      const infoY = cardY + 100;
      const iconSize = 38;
      const textOffsetX = 65;
      
      ctx.font = '48px Nunito, sans-serif';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      
      let currentInfoY = infoY;
      
      // Business icon and name
      if (couponData.business_name) {
        ctx.save();
        // Store/building icon (simplified)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(canvas.width / 2 - 250, currentInfoY - iconSize/2, iconSize, iconSize);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(canvas.width / 2 - 250, currentInfoY - iconSize/2, iconSize, 12);
        
        // Store front details
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.fillRect(canvas.width / 2 - 240, currentInfoY - 5, 8, 15);
        ctx.fillRect(canvas.width / 2 - 225, currentInfoY - 5, 8, 15);
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeText(couponData.business_name, canvas.width / 2 - 250 + textOffsetX, currentInfoY + 10);
        ctx.fillText(couponData.business_name, canvas.width / 2 - 250 + textOffsetX, currentInfoY + 10);
        currentInfoY += 85;
      }
      
      // Location icon and neighborhood
      if (couponData.neighborhood) {
        ctx.save();
        // Modern location pin
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 232, currentInfoY - 10, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 232, currentInfoY + 4);
        ctx.lineTo(canvas.width / 2 - 222, currentInfoY + 18);
        ctx.lineTo(canvas.width / 2 - 242, currentInfoY + 18);
        ctx.closePath();
        ctx.fill();
        
        // Inner dot
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 232, currentInfoY - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeText(couponData.neighborhood, canvas.width / 2 - 250 + textOffsetX, currentInfoY + 10);
        ctx.fillText(couponData.neighborhood, canvas.width / 2 - 250 + textOffsetX, currentInfoY + 10);
        currentInfoY += 85;
      }
      
      // Expiry icon and date
      if (couponData.valid_until) {
        ctx.save();
        // Modern clock/timer icon
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 232, currentInfoY - 5, iconSize/2.2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Clock hands
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 232, currentInfoY - 5);
        ctx.lineTo(canvas.width / 2 - 232, currentInfoY - 18);
        ctx.moveTo(canvas.width / 2 - 232, currentInfoY - 5);
        ctx.lineTo(canvas.width / 2 - 218, currentInfoY - 5);
        ctx.stroke();
        
        // Timer indicator dots
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const dotX = canvas.width / 2 - 232 + 20 * Math.cos(angle);
          const dotY = currentInfoY - 5 + 20 * Math.sin(angle);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeText(`Valid until ${couponData.valid_until}`, canvas.width / 2 - 250 + textOffsetX, currentInfoY + 10);
        ctx.fillText(`Valid until ${couponData.valid_until}`, canvas.width / 2 - 250 + textOffsetX, currentInfoY + 10);
      }
      
      // Modern call to action with neon effect
      ctx.save();
      ctx.font = 'bold 65px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      
      // Create neon glow effect
      ctx.shadowColor = '#FF6B6B';
      ctx.shadowBlur = 25;
      ctx.fillStyle = '#FF6B6B';
      ctx.fillText('CLAIM OFFER!', canvas.width / 2, canvas.height - 170);
      
      // Add bright outline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
      ctx.lineWidth = 4;
      ctx.strokeText('CLAIM OFFER!', canvas.width / 2, canvas.height - 170);
      ctx.restore();
      
      // Convert canvas to blob URL
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      const storyUrl = URL.createObjectURL(blob);
      setGeneratedStoryUrl(storyUrl);
      
    } catch (error) {
      console.error('Error generating Instagram story:', error);
      toast({
        title: "Story Generation Failed",
        description: "Failed to generate Instagram story. Please try again.",
        variant: "destructive",
      });
      setShowStoryPopup(false);
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can delete this event
    const event = userEvents.find(event => event.id === eventId);
    if (!event || !canUserModifyItem(user!.id, event.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to delete this event",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
    }
  };

  const handleEditEvent = (eventId: string) => {
    // Require authentication
    if (!requireAuth()) {
      return;
    }

    // Verify user can edit this event
    const event = userEvents.find(event => event.id === eventId);
    if (!event || !canUserModifyItem(user!.id, event.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to edit this event",
        variant: "destructive",
      });
      return;
    }

    setSelectedEventForEdit(event);
    setShowEditEvent(true);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!requireAuth()) return;

    const coupon = myCoupons.find(c => c.id === couponId);
    if (!coupon || !canUserModifyItem(user!.id, coupon.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to delete this coupon",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteCoupon(couponId);
    }
  };

  const handleEditCoupon = (couponId: string) => {
    if (!requireAuth()) return;

    const coupon = myCoupons.find(c => c.id === couponId);
    if (!coupon || !canUserModifyItem(user!.id, coupon.user_id)) {
      toast({
        title: "Authorization Error",
        description: "You don't have permission to edit this coupon",
        variant: "destructive",
      });
      return;
    }

    setSelectedCouponForEdit(coupon);
    setShowEditCoupon(true);
  };

  // Listen for profile updates (when returning from edit page)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
      refetchEvents(); // Also refresh events when page regains focus
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch, refetchEvents]);

  // Also refetch when returning from navigation
  useEffect(() => {
    refetch();
  }, [id, user?.id]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
    
    const success = await createMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingMessageText(currentText);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editingMessageText.trim()) return;
    
    const success = await updateMessage(editingMessageId, editingMessageText);
    if (success) {
      setEditingMessageId(null);
      setEditingMessageText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleAddFriend = async () => {
    if (!actualProfileId || isOwnProfile) return;
    
    const success = await addFriend(actualProfileId);
    if (success) {
      // Friend added successfully
    }
  };


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20" dir="ltr">
        <Header 
          title="Profile"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center">Loading...</div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Show error state
  if (error || !profileData) {
    // If no user is authenticated and no valid profile ID, redirect to login
    if (!user && (!actualProfileId || !validateUUID(actualProfileId))) {
      return (
        <div className="min-h-screen bg-background pb-20" dir="ltr">
          <Header 
            title="Profile"
            onNotificationsClick={() => setShowNotifications(true)}
          />
          <main className="px-4 py-6 pb-20">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Please log in to view profile
              </p>
              <Button onClick={() => navigate('/login')}>
                Login
              </Button>
            </div>
          </main>
          <BottomNavigation />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background pb-20" dir="ltr">
        <Header 
          title="Profile"
          onNotificationsClick={() => setShowNotifications(true)}
        />
        <main className="px-4 py-6 pb-20">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'Profile not found'}
            </p>
            {isOwnProfile && (
              <Button onClick={() => navigate('/profile/edit')}>
                Create Profile
              </Button>
            )}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="ltr">
      <Header 
        title="Profile"
        onNotificationsClick={() => setShowNotifications(true)}
      />

      <main className="px-4 py-6 pb-20">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <img 
              src={profileData?.profile_image_url || "/lovable-uploads/c7d65671-6211-412e-af1d-6e5cfdaa248e.png"}
              alt={profileData?.name || "User"}
              className="rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              style={{ width: '70px', height: '70px', minWidth: '70px', minHeight: '70px' }}
              onClick={() => setShowProfilePicture(true)}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">{profileData?.name || "User"}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{profileData?.location || "Not specified"}</span>
              </div>
            </div>
            <p className="text-sm text-foreground mb-4">{profileData?.bio || "No description"}</p>
            {profileData?.specialties && profileData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profileData.specialties.map((specialty, index) => (
                  <div key={index} className="rounded-full px-2 py-1 inline-block" style={{ backgroundColor: 'hsl(var(--coral-muted))', color: 'hsl(var(--coral))', borderColor: 'hsl(var(--coral))' }}>
                    <span className="text-xs font-medium">{specialty}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-3 text-sm">
              {profileData?.username ? (
                <a 
                  href={profileData.username} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 underline cursor-pointer"
                  style={{ color: 'hsl(280 60% 55%)' }}
                >
                  Instagram
                </a>
              ) : (
                <span className="text-muted-foreground">No Instagram</span>
              )}
              {isOwnProfile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full p-2 h-8 w-8"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
               {!isOwnProfile && (
                 <div className="flex gap-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className={`rounded-full px-3 py-1 h-7 text-xs ${isFriend(actualProfileId || '') ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' : ''}`}
                     onClick={handleAddFriend}
                   >
                     {isFriend(actualProfileId || '') ? 'Added to friends' : 'Add'}
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className={`rounded-full px-3 py-1 h-7 text-xs ${isFollowing(actualProfileId || '') ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}`}
                     onClick={() => actualProfileId && toggleFollow(actualProfileId)}
                     disabled={isToggling}
                   >
                     {isFollowing(actualProfileId || '') ? 'Following' : 'Follow'}
                   </Button>
                 </div>
               )}
               {isOwnProfile && (
                <Button variant="outline" size="sm" className="rounded-full px-3 py-1 h-7 text-xs" onClick={() => navigate('/profile/edit')}>
                   Edit
                 </Button>
               )}
            </div>
          </div>
        </div>


        {/* Account Type Badge and Business Features */}
        {profileData?.account_type && (
          <section className="mb-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center">
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profileData.account_type === 'business' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {profileData.account_type === 'business' ? 'Business' : 'Personal'}
                </span>
              </div>
              
              {/* Business Account Features - Show manage button only when no coupons */}
              {profileData.account_type === 'business' && isOwnProfile && (!myCoupons || myCoupons.length === 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile/' + user?.id + '#coupons')}
                  className="gap-2 border-purple-400 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Gift className="h-4 w-4" />
                  Manage Coupons
                </Button>
              )}
            </div>
            {/* Business Coupons Display */}
            {profileData.account_type === 'business' && isOwnProfile && myCoupons && myCoupons.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-purple-700">Business Coupons</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myCoupons.slice(0, 4).map((coupon) => (
                    <div key={coupon.id} className="relative group">
                      <div className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                        {coupon.image_url && (
                          <div className="aspect-video bg-muted">
                            <img 
                              src={coupon.image_url} 
                              alt={coupon.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="h-3 w-3 text-primary" />
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                              Coupon
                            </span>
                            {coupon.valid_until && (
                              <span className="text-xs text-muted-foreground">
                                Valid until {new Date(coupon.valid_until).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h5 className="font-medium text-sm mb-1">{coupon.title}</h5>
                          {coupon.business_name && (
                            <p className="text-xs text-primary font-medium mb-1">{coupon.business_name}</p>
                          )}
                          {coupon.discount_amount && (
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-block mb-2 font-semibold">
                              {coupon.discount_amount}
                            </div>
                          )}
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{coupon.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            {coupon.neighborhood && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-2 w-2" />
                                <span>{coupon.neighborhood}</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                       {/* Edit/Delete/Instagram buttons - show on hover */}
                       <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                         <Button
                           variant="secondary"
                           size="sm"
                           className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                           onClick={(e) => {
                             e.stopPropagation();
                             generateCouponInstagramStory(coupon);
                           }}
                           title="Generate Instagram Story"
                         >
                           <Instagram className="h-2 w-2 text-pink-500" />
                         </Button>
                         <Button
                           variant="secondary"
                           size="sm"
                           className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleEditCoupon(coupon.id);
                           }}
                         >
                           <Pencil className="h-2 w-2" />
                         </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           className="h-6 w-6 p-0 bg-white/90 hover:bg-red-50 text-red-600 border-red-200"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteCoupon(coupon.id);
                           }}
                           disabled={deletingCoupon}
                         >
                           <Trash2 className="h-2 w-2" />
                         </Button>
                       </div>
                    </div>
                  ))}
                </div>
                
                {myCoupons.length > 4 && (
                  <div className="mt-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/profile/' + user?.id + '#coupons')}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      View all {myCoupons.length} coupons
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* My Events Section - Only shown for own profile */}
        {isOwnProfile && userEvents && userEvents.length > 0 && (
          <section className="mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">My Events & Meetups</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div 
                    className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-muted">
                      {(event as any).video_url ? (
                        <video 
                          src={(event as any).video_url}
                          className="w-full h-full object-cover"
                          muted
                          autoPlay
                          loop
                          playsInline
                          preload="metadata"
                          poster={event.image_url || communityEvent}
                          onLoadedData={(e) => {
                            // Ensure video plays when loaded
                            e.currentTarget.play().catch(() => {
                              console.log('Autoplay blocked, video will play on user interaction');
                            });
                          }}
                          onError={(e) => {
                            // If video fails to load, hide the video element and show fallback image
                            e.currentTarget.style.display = 'none';
                            console.log('Video failed to load:', (event as any).video_url);
                          }}
                        />
                      ) : (
                        <img 
                          src={event.image_url || communityEvent} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          event.event_type === 'meetup' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {event.event_type === 'meetup' ? 'Meetup' : 'Event'}
                        </span>
                        {event.date && (
                          <span className="text-xs text-muted-foreground">
                            {getRelativeDay(event.date)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location || 'Location TBD'}</span>
                        </div>
                        {event.price && (
                          <span className="text-sm font-semibold text-primary">₪{event.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                   {/* Edit/Delete/Instagram buttons - show on hover */}
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                     <Button
                       variant="secondary"
                       size="sm"
                       className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                       onClick={(e) => {
                         e.stopPropagation();
                         generateInstagramStory(event);
                       }}
                       title="Generate Instagram Story"
                     >
                       <Instagram className="h-3 w-3 text-pink-500" />
                     </Button>
                     <Button
                       variant="secondary"
                       size="sm"
                       className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleEditEvent(event.id);
                       }}
                     >
                       <Pencil className="h-3 w-3" />
                     </Button>
                     <Button
                       variant="destructive"
                       size="sm"
                       className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 border-red-200"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteEvent(event.id);
                       }}
                     >
                       <Trash2 className="h-3 w-3" />
                     </Button>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state for events */}
        {isOwnProfile && userEvents && userEvents.length === 0 && !eventsLoading && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Events & Meetups</h3>
            </div>
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">You haven't created any events or meetups yet</p>
              <Button 
                onClick={() => navigate('/events/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            </div>
          </section>
        )}

        {/* Logout Button */}
        {isOwnProfile && (
          <div className="mt-8 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}

      </main>
      
      <BottomNavigation />
      <NotificationsPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <ProfilePictureViewer
        isOpen={showProfilePicture}
        onClose={() => setShowProfilePicture(false)}
        imageUrl={profileData?.profile_image_url || ""}
        userName={profileData?.name || "User"}
        userId={actualProfileId}
      />
      <FeedImageViewer
        isOpen={showFeedImages}
        onClose={() => {
          setShowFeedImages(false);
          setSelectedImageId(null);
        }}
        images={imagePosts}
        initialImageId={selectedImageId}
      />
      <EditEventPopup 
        isOpen={showEditEvent}
        onClose={() => {
          setShowEditEvent(false);
          setSelectedEventForEdit(null);
        }}
        eventData={selectedEventForEdit}
        onSuccess={() => {
          refetchEvents();
          setShowEditEvent(false);
          setSelectedEventForEdit(null);
        }}
      />
      <EditCouponModal
        isOpen={showEditCoupon}
        onClose={() => {
          setShowEditCoupon(false);
          setSelectedCouponForEdit(null);
        }}
        coupon={selectedCouponForEdit}
        onUpdate={() => {
          refreshCoupons();
          setShowEditCoupon(false);
          setSelectedCouponForEdit(null);
        }}
      />
      
      <InstagramStoryPopup
        isOpen={showStoryPopup}
        onClose={() => setShowStoryPopup(false)}
        storyUrl={generatedStoryUrl}
        isGenerating={generatingStory}
        title={currentEventTitle}
      />
    </div>
  );
};

export default ProfilePage;