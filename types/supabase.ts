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
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wizard_fields: {
        Row: {
          created_at: string | null
          field_type: string
          id: string
          label: string
          options: Json | null
          order_index: number | null
          required: boolean | null
          step_id: string
        }
        Insert: {
          created_at?: string | null
          field_type: string
          id?: string
          label: string
          options?: Json | null
          order_index?: number | null
          required?: boolean | null
          step_id: string
        }
        Update: {
          created_at?: string | null
          field_type?: string
          id?: string
          label?: string
          options?: Json | null
          order_index?: number | null
          required?: boolean | null
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_fields_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "wizard_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_responses: {
        Row: {
          created_at: string | null
          field_id: string
          id: string
          submission_id: string
          value: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          id?: string
          submission_id: string
          value?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          id?: string
          submission_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wizard_responses_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "wizard_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "wizard_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_steps: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          layout_style: string | null
          step_number: number
          title: string | null
          updated_at: string | null
          wizard_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          layout_style?: string | null
          step_number: number
          title?: string | null
          updated_at?: string | null
          wizard_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          layout_style?: string | null
          step_number?: number
          title?: string | null
          updated_at?: string | null
          wizard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_steps_wizard_id_fkey"
            columns: ["wizard_id"]
            isOneToOne: false
            referencedRelation: "wizards"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_submissions: {
        Row: {
          id: string
          metadata: Json | null
          submitted_at: string | null
          submitted_by_ip: string | null
          wizard_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          submitted_at?: string | null
          submitted_by_ip?: string | null
          wizard_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          submitted_at?: string | null
          submitted_by_ip?: string | null
          wizard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_submissions_wizard_id_fkey"
            columns: ["wizard_id"]
            isOneToOne: false
            referencedRelation: "wizards"
            referencedColumns: ["id"]
          },
        ]
      }
      wizards: {
        Row: {
          background_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          font_family: string | null
          id: string
          logo_url: string | null
          theme_color_primary: string | null
          theme_color_secondary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          theme_color_primary?: string | null
          theme_color_secondary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          theme_color_primary?: string | null
          theme_color_secondary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wizards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "super_admin" | "admin" | "client"
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
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      user_role: ["super_admin", "admin", "client"],
    },
  },
} as const

