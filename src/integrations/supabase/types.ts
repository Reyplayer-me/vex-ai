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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: number
          path: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: never
          path?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: never
          path?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      assumptions: {
        Row: {
          created_at: string
          done: boolean
          id: string
          idea_id: string
          source: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          idea_id: string
          source?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          idea_id?: string
          source?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assumptions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          kind: string
          message: string
          name: string | null
          page: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message: string
          name?: string | null
          page?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message?: string
          name?: string | null
          page?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          audience: string | null
          claim_email: string | null
          claim_token_hash: string | null
          created_at: string
          full_report: Json | null
          full_report_at: string | null
          id: string
          idea: string
          input_hash: string
          is_sample: boolean
          overall_score: number
          result: Json
          share_id: string | null
          share_image_url: string | null
          shared_at: string | null
          technical_founder: boolean | null
          updated_at: string
          user_id: string | null
          verdict: string
        }
        Insert: {
          audience?: string | null
          claim_email?: string | null
          claim_token_hash?: string | null
          created_at?: string
          full_report?: Json | null
          full_report_at?: string | null
          id?: string
          idea: string
          input_hash: string
          is_sample?: boolean
          overall_score: number
          result: Json
          share_id?: string | null
          share_image_url?: string | null
          shared_at?: string | null
          technical_founder?: boolean | null
          updated_at?: string
          user_id?: string | null
          verdict: string
        }
        Update: {
          audience?: string | null
          claim_email?: string | null
          claim_token_hash?: string | null
          created_at?: string
          full_report?: Json | null
          full_report_at?: string | null
          id?: string
          idea?: string
          input_hash?: string
          is_sample?: boolean
          overall_score?: number
          result?: Json
          share_id?: string | null
          share_image_url?: string | null
          shared_at?: string | null
          technical_founder?: boolean | null
          updated_at?: string
          user_id?: string | null
          verdict?: string
        }
        Relationships: []
      }
      price_intents: {
        Row: {
          answer: string
          comment: string | null
          created_at: string
          id: string
          visitor_id: string
        }
        Insert: {
          answer: string
          comment?: string | null
          created_at?: string
          id?: string
          visitor_id: string
        }
        Update: {
          answer?: string
          comment?: string | null
          created_at?: string
          id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          goal: string | null
          id: string
          industry: string | null
          last_checkin_sent_at: string | null
          name: string | null
          onboarding_completed: boolean
          skill_level: string | null
          stage: string | null
          target_user: string | null
          updated_at: string
          use_case: string | null
          user_id: string
          weekly_checkin: boolean
        }
        Insert: {
          created_at?: string
          email: string
          goal?: string | null
          id?: string
          industry?: string | null
          last_checkin_sent_at?: string | null
          name?: string | null
          onboarding_completed?: boolean
          skill_level?: string | null
          stage?: string | null
          target_user?: string | null
          updated_at?: string
          use_case?: string | null
          user_id: string
          weekly_checkin?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          goal?: string | null
          id?: string
          industry?: string | null
          last_checkin_sent_at?: string | null
          name?: string | null
          onboarding_completed?: boolean
          skill_level?: string | null
          stage?: string | null
          target_user?: string | null
          updated_at?: string
          use_case?: string | null
          user_id?: string
          weekly_checkin?: boolean
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          day: string
          key: string
        }
        Insert: {
          count?: number
          day?: string
          key: string
        }
        Update: {
          count?: number
          day?: string
          key?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      validation_sessions: {
        Row: {
          build_plan_result: Json | null
          created_at: string
          goal: string | null
          id: string
          idea: string
          industry: string | null
          launch_strategy_result: Json | null
          roadmap_result: Json | null
          target_user: string | null
          updated_at: string
          user_id: string
          validation_result: Json | null
        }
        Insert: {
          build_plan_result?: Json | null
          created_at?: string
          goal?: string | null
          id?: string
          idea: string
          industry?: string | null
          launch_strategy_result?: Json | null
          roadmap_result?: Json | null
          target_user?: string | null
          updated_at?: string
          user_id: string
          validation_result?: Json | null
        }
        Update: {
          build_plan_result?: Json | null
          created_at?: string
          goal?: string | null
          id?: string
          idea?: string
          industry?: string | null
          launch_strategy_result?: Json | null
          roadmap_result?: Json | null
          target_user?: string | null
          updated_at?: string
          user_id?: string
          validation_result?: Json | null
        }
        Relationships: []
      }
      verdict_cache: {
        Row: {
          created_at: string
          input_hash: string
          result: Json
        }
        Insert: {
          created_at?: string
          input_hash: string
          result: Json
        }
        Update: {
          created_at?: string
          input_hash?: string
          result?: Json
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          followup_token_hash: string | null
          id: string
          idea_note: string | null
          ref: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          followup_token_hash?: string | null
          id?: string
          idea_note?: string | null
          ref?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          followup_token_hash?: string | null
          id?: string
          idea_note?: string | null
          ref?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      waitlist_events: {
        Row: {
          created_at: string
          id: number
          name: string
          ref: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          ref?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          ref?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      waitlist_rate_limit: {
        Row: {
          created_at: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          ip_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      waitlist_stats: {
        Row: {
          conversion_pct: number | null
          signups: number | null
          utm_source: string | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_event_counts: {
        Args: { _since?: string }
        Returns: {
          event: string
          total: number
          visitors: number
        }[]
      }
      admin_price_comments: {
        Args: { _since?: string }
        Returns: {
          answer: string
          comment: string
          created_at: string
        }[]
      }
      admin_waitlist_stats: {
        Args: { _since?: string }
        Returns: {
          duplicates: number
          notes: number
          signups: number
          utm_source: string
          views: number
        }[]
      }
      admin_waitlist_total: { Args: never; Returns: number }
      cleanup_stale_data: { Args: never; Returns: undefined }
      consume_rate_limit: {
        Args: { _keys: string[]; _limits: number[] }
        Returns: boolean
      }
      get_public_verdict: {
        Args: { _share_id: string }
        Returns: {
          confidence: string
          created_at: string
          idea_short: string
          image_url: string
          one_liner: string
          overall_score: number
          verdict: string
        }[]
      }
      get_sample_report: {
        Args: never
        Returns: {
          audience: string
          created_at: string
          full_report: Json
          id: string
          idea: string
          result: Json
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refund_rate_limit: { Args: { _keys: string[] }; Returns: undefined }
      set_sample_idea: {
        Args: { _idea_id: string; _on?: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
