export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_emails: {
        Row: {
          account_id: string
          created_at: string
          email_normalized: string
          email_original: string
          id: string
          is_primary: boolean
          verified_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          email_normalized: string
          email_original: string
          id?: string
          is_primary?: boolean
          verified_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          email_normalized?: string
          email_original?: string
          id?: string
          is_primary?: boolean
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_emails_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_identities: {
        Row: {
          account_id: string
          auth_identity_id: string | null
          auth_user_id: string
          id: string
          last_seen_at: string
          linked_at: string
          provider: string | null
          provider_email: string | null
          provider_email_verified: boolean | null
          provider_subject: string | null
        }
        Insert: {
          account_id: string
          auth_identity_id?: string | null
          auth_user_id: string
          id?: string
          last_seen_at?: string
          linked_at?: string
          provider?: string | null
          provider_email?: string | null
          provider_email_verified?: boolean | null
          provider_subject?: string | null
        }
        Update: {
          account_id?: string
          auth_identity_id?: string | null
          auth_user_id?: string
          id?: string
          last_seen_at?: string
          linked_at?: string
          provider?: string | null
          provider_email?: string | null
          provider_email_verified?: boolean | null
          provider_subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_identities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          id: string
          primary_auth_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          primary_auth_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          primary_auth_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_merge_tokens: {
        Row: {
          created_at: string
          expires_at: string
          from_user_id: string
          id: string
          to_email: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          from_user_id: string
          id?: string
          to_email: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          from_user_id?: string
          id?: string
          to_email?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: []
      }
      game_metadata_requests: {
        Row: {
          account_id: string
          created_at: string
          game_id: string
          id: string
          image_url: string | null
          play_time_max: number | null
          play_time_min: number | null
          players_max: number | null
          players_min: number | null
          published_year: number | null
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          game_id: string
          id?: string
          image_url?: string | null
          play_time_max?: number | null
          play_time_min?: number | null
          players_max?: number | null
          players_min?: number | null
          published_year?: number | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          game_id?: string
          id?: string
          image_url?: string | null
          play_time_max?: number | null
          play_time_min?: number | null
          players_max?: number | null
          players_min?: number | null
          published_year?: number | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_metadata_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_metadata_requests_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_tags: {
        Row: {
          created_at: string
          game_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_tags_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          abstracts_rank: number | null
          bgg_bayesaverage: number | null
          bgg_data_source: string | null
          bgg_data_updated_at: string | null
          bgg_id: number | null
          bgg_rank: number | null
          bgg_rating: number | null
          bgg_snapshot_payload: Json | null
          bgg_url: string | null
          bgg_usersrated: number | null
          bgg_weight: number | null
          buy_priority: number | null
          category: string | null
          cgs_rank: number | null
          childrensgames_rank: number | null
          created_at: string
          familygames_rank: number | null
          gap_reason: string | null
          hidden: boolean
          id: string
          image_url: string | null
          is_expansion: boolean | null
          is_expansion_included: boolean
          name: string
          notes: string | null
          partygames_rank: number | null
          play_time_max: number | null
          play_time_min: number | null
          players_max: number | null
          players_min: number | null
          published_year: number | null
          recommendation_colour: string | null
          recommendation_verdict: string | null
          search_vector: unknown
          slug: string
          status: string
          strategygames_rank: number | null
          summary: string | null
          thematic_rank: number | null
          updated_at: string
          wargames_rank: number | null
        }
        Insert: {
          abstracts_rank?: number | null
          bgg_bayesaverage?: number | null
          bgg_data_source?: string | null
          bgg_data_updated_at?: string | null
          bgg_id?: number | null
          bgg_rank?: number | null
          bgg_rating?: number | null
          bgg_snapshot_payload?: Json | null
          bgg_url?: string | null
          bgg_usersrated?: number | null
          bgg_weight?: number | null
          buy_priority?: number | null
          category?: string | null
          cgs_rank?: number | null
          childrensgames_rank?: number | null
          created_at?: string
          familygames_rank?: number | null
          gap_reason?: string | null
          hidden?: boolean
          id?: string
          image_url?: string | null
          is_expansion?: boolean | null
          is_expansion_included?: boolean
          name: string
          notes?: string | null
          partygames_rank?: number | null
          play_time_max?: number | null
          play_time_min?: number | null
          players_max?: number | null
          players_min?: number | null
          published_year?: number | null
          recommendation_colour?: string | null
          recommendation_verdict?: string | null
          search_vector?: unknown
          slug: string
          status?: string
          strategygames_rank?: number | null
          summary?: string | null
          thematic_rank?: number | null
          updated_at?: string
          wargames_rank?: number | null
        }
        Update: {
          abstracts_rank?: number | null
          bgg_bayesaverage?: number | null
          bgg_data_source?: string | null
          bgg_data_updated_at?: string | null
          bgg_id?: number | null
          bgg_rank?: number | null
          bgg_rating?: number | null
          bgg_snapshot_payload?: Json | null
          bgg_url?: string | null
          bgg_usersrated?: number | null
          bgg_weight?: number | null
          buy_priority?: number | null
          category?: string | null
          cgs_rank?: number | null
          childrensgames_rank?: number | null
          created_at?: string
          familygames_rank?: number | null
          gap_reason?: string | null
          hidden?: boolean
          id?: string
          image_url?: string | null
          is_expansion?: boolean | null
          is_expansion_included?: boolean
          name?: string
          notes?: string | null
          partygames_rank?: number | null
          play_time_max?: number | null
          play_time_min?: number | null
          players_max?: number | null
          players_min?: number | null
          published_year?: number | null
          recommendation_colour?: string | null
          recommendation_verdict?: string | null
          search_vector?: unknown
          slug?: string
          status?: string
          strategygames_rank?: number | null
          summary?: string | null
          thematic_rank?: number | null
          updated_at?: string
          wargames_rank?: number | null
        }
        Relationships: []
      }
      library_entries: {
        Row: {
          account_id: string
          created_at: string
          game_id: string
          id: string
          is_in_collection: boolean
          is_loved: boolean
          is_saved: boolean
          notes: string | null
          priority: number | null
          sentiment: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          game_id: string
          id?: string
          is_in_collection?: boolean
          is_loved?: boolean
          is_saved?: boolean
          notes?: string | null
          priority?: number | null
          sentiment?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          game_id?: string
          id?: string
          is_in_collection?: boolean
          is_loved?: boolean
          is_saved?: boolean
          notes?: string | null
          priority?: number | null
          sentiment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_entries_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      passkeys: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_collection_public: boolean
          is_profile_public: boolean
          is_saved_public: boolean
          role: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_collection_public?: boolean
          is_profile_public?: boolean
          is_saved_public?: boolean
          role?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_collection_public?: boolean
          is_profile_public?: boolean
          is_saved_public?: boolean
          role?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          colour: string | null
          created_at: string
          id: string
          name: string
          slug: string
          tag_type: string | null
          updated_at: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          tag_type?: string | null
          updated_at?: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          tag_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_game_tags: {
        Row: {
          created_at: string
          library_entry_id: string
          user_tag_id: string
        }
        Insert: {
          created_at?: string
          library_entry_id: string
          user_tag_id: string
        }
        Update: {
          created_at?: string
          library_entry_id?: string
          user_tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_game_tags_library_entry_id_fkey"
            columns: ["library_entry_id"]
            isOneToOne: false
            referencedRelation: "library_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_game_tags_user_tag_id_fkey"
            columns: ["user_tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tags: {
        Row: {
          account_id: string
          colour: string | null
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          account_id: string
          colour?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          colour?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_account_id: { Args: never; Returns: string }
      get_current_account_context: {
        Args: never
        Returns: {
          account_id: string
          primary_auth_user_id: string
          primary_email: string
        }[]
      }
      get_public_library: {
        Args: { p_list_type: string; p_username: string }
        Returns: {
          bgg_id: number
          bgg_rating: number
          bgg_url: string
          bgg_weight: number
          category: string
          game_id: string
          game_name: string
          game_slug: string
          image_url: string
          is_expansion_included: boolean
          library_entry_id: string
          play_time_max: number
          play_time_min: number
          players_max: number
          players_min: number
          profile_id: string
          published_year: number
          saved_at: string
          summary: string
          username: string
        }[]
      }
      get_public_profile: {
        Args: { p_username: string }
        Returns: {
          id: string
          is_collection_public: boolean
          is_profile_public: boolean
          is_saved_public: boolean
          username: string
        }[]
      }
      import_bgg_games_batch: { Args: { batch: Json }; Returns: undefined }
      is_owner: { Args: never; Returns: boolean }
      merge_user_data: {
        Args: { p_from_user_id: string; p_to_user_id: string }
        Returns: undefined
      }
      save_bgg_game_for_account: {
        Args: {
          p_account_id: string
          p_bgg_id: number
          p_bgg_rating?: number
          p_bgg_url: string
          p_bgg_weight?: number
          p_image_url?: string
          p_is_in_collection?: boolean
          p_is_loved?: boolean
          p_is_saved?: boolean
          p_name: string
          p_notes?: string
          p_play_time_max?: number
          p_play_time_min?: number
          p_players_max?: number
          p_players_min?: number
          p_published_year?: number
          p_sentiment?: string
          p_slug: string
          p_summary?: string
        }
        Returns: {
          account_id: string
          created_at: string
          game_id: string
          id: string
          is_in_collection: boolean
          is_loved: boolean
          is_saved: boolean
          notes: string | null
          priority: number | null
          sentiment: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "library_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_public_profiles: {
        Args: { prefix?: string }
        Returns: {
          username: string
        }[]
      }
      slugify: { Args: { input: string }; Returns: string }
      submit_game_metadata_request: {
        Args: {
          p_game_id: string
          p_image_url?: string
          p_play_time_max?: number
          p_play_time_min?: number
          p_players_max?: number
          p_players_min?: number
          p_published_year?: number
          p_summary?: string
        }
        Returns: {
          account_id: string
          created_at: string
          game_id: string
          id: string
          image_url: string | null
          play_time_max: number | null
          play_time_min: number | null
          players_max: number | null
          players_min: number | null
          published_year: number | null
          status: string
          summary: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "game_metadata_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_game_missing_metadata:
        | {
            Args: {
              p_game_id: string
              p_image_url?: string
              p_summary?: string
            }
            Returns: {
              abstracts_rank: number | null
              bgg_bayesaverage: number | null
              bgg_data_source: string | null
              bgg_data_updated_at: string | null
              bgg_id: number | null
              bgg_rank: number | null
              bgg_rating: number | null
              bgg_snapshot_payload: Json | null
              bgg_url: string | null
              bgg_usersrated: number | null
              bgg_weight: number | null
              buy_priority: number | null
              category: string | null
              cgs_rank: number | null
              childrensgames_rank: number | null
              created_at: string
              familygames_rank: number | null
              gap_reason: string | null
              hidden: boolean
              id: string
              image_url: string | null
              is_expansion: boolean | null
              is_expansion_included: boolean
              name: string
              notes: string | null
              partygames_rank: number | null
              play_time_max: number | null
              play_time_min: number | null
              players_max: number | null
              players_min: number | null
              published_year: number | null
              recommendation_colour: string | null
              recommendation_verdict: string | null
              search_vector: unknown
              slug: string
              status: string
              strategygames_rank: number | null
              summary: string | null
              thematic_rank: number | null
              updated_at: string
              wargames_rank: number | null
            }
            SetofOptions: {
              from: "*"
              to: "games"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              p_game_id: string
              p_image_url?: string
              p_play_time_max?: number
              p_play_time_min?: number
              p_players_max?: number
              p_players_min?: number
              p_published_year?: number
              p_summary?: string
            }
            Returns: {
              abstracts_rank: number | null
              bgg_bayesaverage: number | null
              bgg_data_source: string | null
              bgg_data_updated_at: string | null
              bgg_id: number | null
              bgg_rank: number | null
              bgg_rating: number | null
              bgg_snapshot_payload: Json | null
              bgg_url: string | null
              bgg_usersrated: number | null
              bgg_weight: number | null
              buy_priority: number | null
              category: string | null
              cgs_rank: number | null
              childrensgames_rank: number | null
              created_at: string
              familygames_rank: number | null
              gap_reason: string | null
              hidden: boolean
              id: string
              image_url: string | null
              is_expansion: boolean | null
              is_expansion_included: boolean
              name: string
              notes: string | null
              partygames_rank: number | null
              play_time_max: number | null
              play_time_min: number | null
              players_max: number | null
              players_min: number | null
              published_year: number | null
              recommendation_colour: string | null
              recommendation_verdict: string | null
              search_vector: unknown
              slug: string
              status: string
              strategygames_rank: number | null
              summary: string | null
              thematic_rank: number | null
              updated_at: string
              wargames_rank: number | null
            }
            SetofOptions: {
              from: "*"
              to: "games"
              isOneToOne: true
              isSetofReturn: false
            }
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

