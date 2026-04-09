export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Relationships: [];
        Row: {
          id: string;
          email: string | null;
          role: "owner" | "viewer";
          username: string | null;
          is_profile_public: boolean;
          is_collection_public: boolean;
          is_saved_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: "owner" | "viewer";
          username?: string | null;
          is_profile_public?: boolean;
          is_collection_public?: boolean;
          is_saved_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      games: {
        Relationships: [];
        Row: {
          id: string;
          name: string;
          slug: string;
          bgg_id: number | null;
          bgg_url: string | null;
          status: "owned" | "buy" | "new_rec" | "cut" | "archived";
          buy_priority: number | null;
          bgg_rating: number | null;
          bgg_weight: number | null;
          bgg_rank?: number | null;
          bgg_bayesaverage?: number | null;
          bgg_usersrated?: number | null;
          is_expansion?: boolean | null;
          abstracts_rank?: number | null;
          cgs_rank?: number | null;
          childrensgames_rank?: number | null;
          familygames_rank?: number | null;
          partygames_rank?: number | null;
          strategygames_rank?: number | null;
          thematic_rank?: number | null;
          wargames_rank?: number | null;
          bgg_data_source?: string | null;
          bgg_data_updated_at?: string | null;
          bgg_snapshot_payload?: Json | null;
          search_vector?: string | null;
          players_min: number | null;
          players_max: number | null;
          play_time_min: number | null;
          play_time_max: number | null;
          category: string | null;
          summary: string | null;
          notes: string | null;
          recommendation_verdict: string | null;
          recommendation_colour: string | null;
          gap_reason: string | null;
          is_expansion_included: boolean;
          image_url: string | null;
          published_year: number | null;
          hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          bgg_id?: number | null;
          bgg_url?: string | null;
          status?: "owned" | "buy" | "new_rec" | "cut" | "archived";
          buy_priority?: number | null;
          bgg_rating?: number | null;
          bgg_weight?: number | null;
          bgg_rank?: number | null;
          bgg_bayesaverage?: number | null;
          bgg_usersrated?: number | null;
          is_expansion?: boolean | null;
          abstracts_rank?: number | null;
          cgs_rank?: number | null;
          childrensgames_rank?: number | null;
          familygames_rank?: number | null;
          partygames_rank?: number | null;
          strategygames_rank?: number | null;
          thematic_rank?: number | null;
          wargames_rank?: number | null;
          bgg_data_source?: string | null;
          bgg_data_updated_at?: string | null;
          bgg_snapshot_payload?: Json | null;
          search_vector?: string | null;
          players_min?: number | null;
          players_max?: number | null;
          play_time_min?: number | null;
          play_time_max?: number | null;
          category?: string | null;
          summary?: string | null;
          notes?: string | null;
          recommendation_verdict?: string | null;
          recommendation_colour?: string | null;
          gap_reason?: string | null;
          is_expansion_included?: boolean;
          image_url?: string | null;
          published_year?: number | null;
          hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
      };
      tags: {
        Relationships: [];
        Row: {
          id: string;
          name: string;
          slug: string;
          tag_type: string | null;
          colour: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tag_type?: string | null;
          colour?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      game_tags: {
        Relationships: [
          {
            foreignKeyName: "game_tags_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
        Row: {
          game_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          game_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["game_tags"]["Insert"]>;
      };
      library_entries: {
        Relationships: [
          {
            foreignKeyName: "library_entries_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "library_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          is_saved: boolean;
          is_loved: boolean;
          is_in_collection: boolean;
          sentiment: "like" | "dislike" | "neutral" | null;
          notes: string | null;
          priority: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          is_saved?: boolean;
          is_loved?: boolean;
          is_in_collection?: boolean;
          sentiment?: "like" | "dislike" | "neutral" | null;
          notes?: string | null;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["library_entries"]["Insert"]>;
      };
      user_tags: {
        Relationships: [
          {
            foreignKeyName: "user_tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          colour: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          colour?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_tags"]["Insert"]>;
      };
      user_game_tags: {
        Relationships: [
          {
            foreignKeyName: "user_game_tags_library_entry_id_fkey";
            columns: ["library_entry_id"];
            isOneToOne: false;
            referencedRelation: "library_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_game_tags_user_tag_id_fkey";
            columns: ["user_tag_id"];
            isOneToOne: false;
            referencedRelation: "user_tags";
            referencedColumns: ["id"];
          },
        ];
        Row: {
          library_entry_id: string;
          user_tag_id: string;
          created_at: string;
        };
        Insert: {
          library_entry_id: string;
          user_tag_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_game_tags"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_public_profiles: {
        Args: {
          prefix?: string;
        };
        Returns: {
          username: string;
        }[];
      };
      get_public_profile: {
        Args: {
          p_username: string;
        };
        Returns: {
          id: string;
          username: string;
          is_profile_public: boolean;
          is_collection_public: boolean;
          is_saved_public: boolean;
        }[];
      };
      get_public_library: {
        Args: {
          p_username: string;
          p_list_type: "collection" | "saved";
        };
        Returns: {
          profile_id: string;
          username: string;
          library_entry_id: string;
          game_id: string;
          game_name: string;
          game_slug: string;
          bgg_id: number | null;
          bgg_url: string | null;
          bgg_rating: number | null;
          bgg_weight: number | null;
          players_min: number | null;
          players_max: number | null;
          play_time_min: number | null;
          play_time_max: number | null;
          category: string | null;
          summary: string | null;
          is_expansion_included: boolean;
          image_url: string | null;
          published_year: number | null;
          saved_at: string;
        }[];
      };
      save_bgg_game_for_user: {
        Args: {
          p_user_id: string;
          p_bgg_id: number;
          p_name: string;
          p_slug: string;
          p_bgg_url: string;
          p_image_url?: string | null;
          p_published_year?: number | null;
          p_players_min?: number | null;
          p_players_max?: number | null;
          p_play_time_min?: number | null;
          p_play_time_max?: number | null;
          p_bgg_rating?: number | null;
          p_bgg_weight?: number | null;
          p_summary?: string | null;
          p_is_saved?: boolean;
          p_is_loved?: boolean;
          p_is_in_collection?: boolean;
          p_sentiment?: "like" | "dislike" | "neutral" | null;
          p_notes?: string | null;
        };
        Returns: Database["public"]["Tables"]["library_entries"]["Row"];
      };
      import_bgg_games_batch: {
        Args: {
          batch: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
