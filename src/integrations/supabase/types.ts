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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          access_type: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string
          subcategory: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          subcategory?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          subcategory?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          id: string
          joined_at: string | null
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
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
          community_id: string | null
          created_at: string
          description: string | null
          discount_amount: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          terms: string | null
          title: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          business_name: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          terms?: string | null
          title?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          business_name?: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          terms?: string | null
          title?: string | null
          updated_at?: string
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
      coupon_claims: {
        Row: {
          claimed_at: string
          created_at: string
          id: string
          is_used: boolean | null
          perk_id: string | null
          qr_code_data: string | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          perk_id?: string | null
          qr_code_data?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          perk_id?: string | null
          qr_code_data?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_claims_perk_id_fkey"
            columns: ["perk_id"]
            isOneToOne: false
            referencedRelation: "community_perks"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string | null
          age_range: string | null
          created_at: string
          date: string | null
          description: string | null
          event_type: string | null
          external_link: string | null
          id: string
          image_url: string | null
          instagram_link: string | null
          location: string | null
          market: string | null
          mood: string | null
          music_type: string | null
          price: string | null
          price_range: string | null
          target_audience: string | null
          ticket_link: string | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
          venue_name: string | null
          venue_size: string | null
          venue_type: string | null
          video_url: string | null
        }
        Insert: {
          address?: string | null
          age_range?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          event_type?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          instagram_link?: string | null
          location?: string | null
          market?: string | null
          mood?: string | null
          music_type?: string | null
          price?: string | null
          price_range?: string | null
          target_audience?: string | null
          ticket_link?: string | null
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
          venue_name?: string | null
          venue_size?: string | null
          venue_type?: string | null
          video_url?: string | null
        }
        Update: {
          address?: string | null
          age_range?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          event_type?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          instagram_link?: string | null
          location?: string | null
          market?: string | null
          mood?: string | null
          music_type?: string | null
          price?: string | null
          price_range?: string | null
          target_audience?: string | null
          ticket_link?: string | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          venue_name?: string | null
          venue_size?: string | null
          venue_type?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      friends_picture_galleries: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          price: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          related_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          interests: string[] | null
          location: string | null
          name: string | null
          profile_image_url: string | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string | null
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          business_name: string | null
          created_at: string
          description: string | null
          discount_amount: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
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
          is_active?: boolean | null
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
          is_active?: boolean | null
          neighborhood?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_picture_galleries: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_community_membership_status: {
        Args: { membership_id: string; new_status: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
