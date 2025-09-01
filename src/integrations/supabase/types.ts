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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          doctor_id: string
          duration_minutes: number | null
          follow_up_required: boolean | null
          id: string
          meeting_url: string | null
          notes: string | null
          prescription: string | null
          scheduled_at: string
          status: string | null
          symptoms: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          doctor_id: string
          duration_minutes?: number | null
          follow_up_required?: boolean | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          prescription?: string | null
          scheduled_at: string
          status?: string | null
          symptoms?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          doctor_id?: string
          duration_minutes?: number | null
          follow_up_required?: boolean | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          prescription?: string | null
          scheduled_at?: string
          status?: string | null
          symptoms?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_bot: boolean | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_bot?: boolean | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_bot?: boolean | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          available_hours: Json | null
          avatar_url: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          location: string | null
          name: string
          qualifications: string[] | null
          rating: number | null
          specialty: string
          updated_at: string | null
        }
        Insert: {
          available_hours?: Json | null
          avatar_url?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          location?: string | null
          name: string
          qualifications?: string[] | null
          rating?: number | null
          specialty: string
          updated_at?: string | null
        }
        Update: {
          available_hours?: Json | null
          avatar_url?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          location?: string | null
          name?: string
          qualifications?: string[] | null
          rating?: number | null
          specialty?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          created_at: string | null
          diastolic: number | null
          id: string
          metric_type: string
          notes: string | null
          recorded_at: string | null
          systolic: number | null
          unit: string | null
          user_id: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string | null
          diastolic?: number | null
          id?: string
          metric_type: string
          notes?: string | null
          recorded_at?: string | null
          systolic?: number | null
          unit?: string | null
          user_id: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string | null
          diastolic?: number | null
          id?: string
          metric_type?: string
          notes?: string | null
          recorded_at?: string | null
          systolic?: number | null
          unit?: string | null
          user_id?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string | null
          id: string
          medication_id: string
          notes: string | null
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          id: string
          medical_conditions: string[] | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_conditions?: string[] | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
