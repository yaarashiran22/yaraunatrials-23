export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          access_type: string
          category: string
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          market: string | null
          member_count: number | null
          name: string
          subcategory: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          access_type?: string
          category: string
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market?: string | null
          member_count?: number | null
          name: string
          subcategory?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          access_type?: string
          category?: string
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market?: string | null
          member_count?: number | null
          name?: string
          subcategory?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          community_id: string
          created_at: string
          creator_id: string
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          is_members_only: boolean | null
          location: string | null
          max_attendees: number | null
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          creator_id: string
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_members_only?: boolean | null
          location?: string | null
          max_attendees?: number | null
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          creator_id?: string
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_members_only?: boolean | null
          location?: string | null
          max_attendees?: number | null
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          id: string
          joined_at: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_perks: {
        Row: {
          business_name: string
          community_id: string
          created_at: string
          description: string
          discount_amount: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          terms: string | null
          title: string
          valid_until: string | null
        }
        Insert: {
          business_name: string
          community_id: string
          created_at?: string
          description: string
          discount_amount?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          terms?: string | null
          title: string
          valid_until?: string | null
        }
        Update: {
          business_name?: string
          community_id?: string
          created_at?: string
          description?: string
          discount_amount?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          terms?: string | null
          title?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_perks_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_companion_requests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          event_type: string
          external_link: string | null
          id: string
          image_url: string | null
          location: string | null
          market: string | null
          mood: string | null
          price: string | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          event_type?: string
          external_link?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          market?: string | null
          mood?: string | null
          price?: string | null
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          event_type?: string
          external_link?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          market?: string | null
          mood?: string | null
          price?: string | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      friends_feed_posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          market: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          market?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          market?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friends_picture_galleries: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          images: string[]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          images?: string[]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          images?: string[]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_votes: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          user_id: string
          vote: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
          vote: boolean
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          location: string | null
          market: string | null
          mobile_number: string | null
          price: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          location?: string | null
          market?: string | null
          mobile_number?: string | null
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          location?: string | null
          market?: string | null
          mobile_number?: string | null
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      neighbor_question_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighbor_question_comments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "neighbor_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      neighbor_questions: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          market: string | null
          message_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          market?: string | null
          message_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          market?: string | null
          message_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      neighborhood_ideas: {
        Row: {
          created_at: string
          id: string
          image_url: string
          market: string | null
          neighborhood: string
          question: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          market?: string | null
          neighborhood: string
          question: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          market?: string | null
          neighborhood?: string
          question?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_user_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_user_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_user_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_gallery_likes: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          friends_only: boolean
          id: string
          image_url: string | null
          location: string | null
          market: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          friends_only?: boolean
          id?: string
          image_url?: string | null
          location?: string | null
          market?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          friends_only?: boolean
          id?: string
          image_url?: string | null
          location?: string | null
          market?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          interests: string[] | null
          is_private: boolean | null
          location: string | null
          market: string | null
          mobile_number: string | null
          name: string | null
          open_to_connecting: boolean | null
          profile_image_url: string | null
          show_in_search: boolean | null
          specialties: string[] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          account_type?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          interests?: string[] | null
          is_private?: boolean | null
          location?: string | null
          market?: string | null
          mobile_number?: string | null
          name?: string | null
          open_to_connecting?: boolean | null
          profile_image_url?: string | null
          show_in_search?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          account_type?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          interests?: string[] | null
          is_private?: boolean | null
          location?: string | null
          market?: string | null
          mobile_number?: string | null
          name?: string | null
          open_to_connecting?: boolean | null
          profile_image_url?: string | null
          show_in_search?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      recommendation_agreements: {
        Row: {
          created_at: string
          id: string
          recommendation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recommendation_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recommendation_id?: string
          user_id?: string
        }
        Relationships: []
      }
      smallprofiles: {
        Row: {
          created_at: string
          id: string
          photo: string | null
        }
        Insert: {
          created_at?: string
          id: string
          photo?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          photo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smallprofiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          image_url: string
          is_announcement: boolean | null
          market: string | null
          story_type: string | null
          text_content: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url: string
          is_announcement?: boolean | null
          market?: string | null
          story_type?: string | null
          text_content?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string
          is_announcement?: boolean | null
          market?: string | null
          story_type?: string | null
          text_content?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_coupon_claims: {
        Row: {
          claimed_at: string
          created_at: string
          id: string
          is_used: boolean
          perk_id: string
          qr_code_data: string
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          id?: string
          is_used?: boolean
          perk_id: string
          qr_code_data: string
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          created_at?: string
          id?: string
          is_used?: boolean
          perk_id?: string
          qr_code_data?: string
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupon_claims_perk_id_fkey"
            columns: ["perk_id"]
            isOneToOne: false
            referencedRelation: "community_perks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          business_name: string | null
          created_at: string
          description: string | null
          discount_amount: string | null
          id: string
          image_url: string | null
          is_active: boolean
          neighborhood: string | null
          title: string
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          neighborhood?: string | null
          title: string
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          neighborhood?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_following: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          mood: string | null
          status: string | null
          status_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          mood?: string | null
          status?: string | null
          status_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          mood?: string | null
          status?: string | null
          status_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_picture_galleries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_detect_market: boolean
          created_at: string
          id: string
          language: string | null
          preferred_market: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_detect_market?: boolean
          created_at?: string
          id?: string
          language?: string | null
          preferred_market?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_detect_market?: boolean
          created_at?: string
          id?: string
          language?: string | null
          preferred_market?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_hanging_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rotate_daily_challenge: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_community_membership_status: {
        Args: { membership_id: string; new_status: string }
        Returns: boolean
      }
      update_meetup_join_status: {
        Args: { new_status: string; rsvp_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
