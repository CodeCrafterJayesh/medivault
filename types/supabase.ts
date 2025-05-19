export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_history: {
        Row: {
          id: string
          user_id: string
          chronic_illnesses: string[] | null
          previous_surgeries: Json | null
          allergies: Json | null
          current_medications: Json | null
          family_history: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chronic_illnesses?: string[] | null
          previous_surgeries?: Json | null
          allergies?: Json | null
          current_medications?: Json | null
          family_history?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chronic_illnesses?: string[] | null
          previous_surgeries?: Json | null
          allergies?: Json | null
          current_medications?: Json | null
          family_history?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          user_id: string
          full_name: string
          relationship: string
          phone_number: string
          alternate_number: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          relationship: string
          phone_number: string
          alternate_number?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          relationship?: string
          phone_number?: string
          alternate_number?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          theme: string | null
          notification_enabled: boolean | null
          data_sharing_enabled: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          theme?: string | null
          notification_enabled?: boolean | null
          data_sharing_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme?: string | null
          notification_enabled?: boolean | null
          data_sharing_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          title: string
          doctor_name: string | null
          location: string | null
          date: string
          notes: string | null
          reminder_enabled: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          doctor_name?: string | null
          location?: string | null
          date: string
          notes?: string | null
          reminder_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          doctor_name?: string | null
          location?: string | null
          date?: string
          notes?: string | null
          reminder_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_reports: {
        Row: {
          id: string
          user_id: string
          title: string
          file_url: string
          file_type: string
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          file_url: string
          file_type: string
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          file_url?: string
          file_type?: string
          date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
