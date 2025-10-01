import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on the existing schema
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          owner_id: string
          max_seats: number
          active_seats: number
          plan: string
          status: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          owner_id: string
          max_seats?: number
          active_seats?: number
          plan?: string
          status?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          owner_id?: string
          max_seats?: number
          active_seats?: number
          plan?: string
          status?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          first_name: string | null
          last_name: string | null
          email: string
          password_hash: string
          role: string
          preferred_language: string | null
          learning_style: string | null
          teaching_style: string | null
          profile_photo_url: string | null
          onboarding_status: string | null
          organization_id: string | null
          email_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          first_name?: string | null
          last_name?: string | null
          email: string
          password_hash: string
          role: string
          preferred_language?: string | null
          learning_style?: string | null
          teaching_style?: string | null
          profile_photo_url?: string | null
          onboarding_status?: string | null
          organization_id?: string | null
          email_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          password_hash?: string
          role?: string
          preferred_language?: string | null
          learning_style?: string | null
          teaching_style?: string | null
          profile_photo_url?: string | null
          onboarding_status?: string | null
          organization_id?: string | null
          email_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          grade_band: string
          student_count: number
          teacher_student_ratio: string | null
          iep_count: number | null
          ifsp_count: number | null
          stressors: string[] | null
          educator_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          grade_band: string
          student_count?: number
          teacher_student_ratio?: string | null
          iep_count?: number | null
          ifsp_count?: number | null
          stressors?: string[] | null
          educator_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          grade_band?: string
          student_count?: number
          teacher_student_ratio?: string | null
          iep_count?: number | null
          ifsp_count?: number | null
          stressors?: string[] | null
          educator_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      children: {
        Row: {
          id: string
          name: string
          age: number | null
          grade_band: string
          classroom_id: string
          developmental_notes: string | null
          language_ability: string | null
          self_regulation_skills: string | null
          sensory_sensitivities: string[] | null
          has_iep: boolean | null
          has_ifsp: boolean | null
          support_plans: string[] | null
          known_triggers: string[] | null
          home_language: string | null
          family_context: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          age?: number | null
          grade_band: string
          classroom_id: string
          developmental_notes?: string | null
          language_ability?: string | null
          self_regulation_skills?: string | null
          sensory_sensitivities?: string[] | null
          has_iep?: boolean | null
          has_ifsp?: boolean | null
          support_plans?: string[] | null
          known_triggers?: string[] | null
          home_language?: string | null
          family_context?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          age?: number | null
          grade_band?: string
          classroom_id?: string
          developmental_notes?: string | null
          language_ability?: string | null
          self_regulation_skills?: string | null
          sensory_sensitivities?: string[] | null
          has_iep?: boolean | null
          has_ifsp?: boolean | null
          support_plans?: string[] | null
          known_triggers?: string[] | null
          home_language?: string | null
          family_context?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      behavior_logs: {
        Row: {
          id: string
          educator_id: string
          child_id: string | null
          classroom_id: string | null
          behavior_description: string
          context: string
          time_of_day: string | null
          severity: string
          educator_mood: string | null
          stressors: string[] | null
          intensity: string | null
          duration: string | null
          frequency: string | null
          adult_response: string[] | null
          outcome: string[] | null
          developmental_notes: string | null
          supports: string[] | null
          classroom_ratio: string | null
          resources_available: string[] | null
          educator_stress_level: string | null
          confidence_level: number | null
          ai_response: any | null
          selected_strategy: string | null
          confidence_rating: number | null
          reflection_notes: string | null
          phi_flag: any | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          educator_id: string
          child_id?: string | null
          classroom_id?: string | null
          behavior_description: string
          context: string
          time_of_day?: string | null
          severity: string
          educator_mood?: string | null
          stressors?: string[] | null
          intensity?: string | null
          duration?: string | null
          frequency?: string | null
          adult_response?: string[] | null
          outcome?: string[] | null
          developmental_notes?: string | null
          supports?: string[] | null
          classroom_ratio?: string | null
          resources_available?: string[] | null
          educator_stress_level?: string | null
          confidence_level?: number | null
          ai_response?: any | null
          selected_strategy?: string | null
          confidence_rating?: number | null
          reflection_notes?: string | null
          phi_flag?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          educator_id?: string
          child_id?: string | null
          classroom_id?: string | null
          behavior_description?: string
          context?: string
          time_of_day?: string | null
          severity?: string
          educator_mood?: string | null
          stressors?: string[] | null
          intensity?: string | null
          duration?: string | null
          frequency?: string | null
          adult_response?: string[] | null
          outcome?: string[] | null
          developmental_notes?: string | null
          supports?: string[] | null
          classroom_ratio?: string | null
          resources_available?: string[] | null
          educator_stress_level?: string | null
          confidence_level?: number | null
          ai_response?: any | null
          selected_strategy?: string | null
          confidence_rating?: number | null
          reflection_notes?: string | null
          phi_flag?: any | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      classroom_logs: {
        Row: {
          id: string
          educator_id: string
          classroom_id: string
          challenge_description: string
          context: string
          severity: string
          educator_mood: string | null
          stressors: string[] | null
          ai_response: any | null
          selected_strategy: string | null
          confidence_self_rating: number | null
          confidence_strategy_rating: number | null
          reflection_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          educator_id: string
          classroom_id: string
          challenge_description: string
          context: string
          severity: string
          educator_mood?: string | null
          stressors?: string[] | null
          ai_response?: any | null
          selected_strategy?: string | null
          confidence_self_rating?: number | null
          confidence_strategy_rating?: number | null
          reflection_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          educator_id?: string
          classroom_id?: string
          challenge_description?: string
          context?: string
          severity?: string
          educator_mood?: string | null
          stressors?: string[] | null
          ai_response?: any | null
          selected_strategy?: string | null
          confidence_self_rating?: number | null
          confidence_strategy_rating?: number | null
          reflection_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          organization_id: string
          organization_name: string
          inviter_name: string
          token: string
          status: string | null
          expires_at: string
          accepted_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          email: string
          organization_id: string
          organization_name: string
          inviter_name: string
          token: string
          status?: string | null
          expires_at: string
          accepted_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          organization_id?: string
          organization_name?: string
          inviter_name?: string
          token?: string
          status?: string | null
          expires_at?: string
          accepted_at?: string | null
          created_at?: string | null
        }
      }
    }
  }
}