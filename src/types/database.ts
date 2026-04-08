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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: "owner" | "viewer";
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
        Relationships: [];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
