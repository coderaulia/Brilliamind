export type UserRole = 'admin' | 'instructor' | 'learner'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'text' | 'video' | 'youtube' | 'pdf' | 'quiz'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: UserRole
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      courses: {
        Row: {
          id: string
          instructor_id: string
          title: string
          slug: string
          description: string | null
          cover_url: string | null
          category: string | null
          tags: string[]
          price: number
          currency: string
          status: CourseStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      sections: {
        Row: {
          id: string
          course_id: string
          title: string
          position: number
        }
        Insert: Omit<Database['public']['Tables']['sections']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sections']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          section_id: string
          title: string
          type: LessonType
          content_json: Record<string, unknown> | null
          video_url: string | null
          pdf_url: string | null
          position: number
          is_free_preview: boolean
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'>
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>
      }
      video_watch_logs: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          watch_seconds: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['video_watch_logs']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['video_watch_logs']['Insert']>
      }
      quiz_definitions: {
        Row: {
          id: string
          lesson_id: string
          schema_json: Record<string, unknown>
          passing_score: number
          time_limit_sec: number | null
          max_attempts: number
        }
        Insert: Omit<Database['public']['Tables']['quiz_definitions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['quiz_definitions']['Insert']>
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          passed: boolean
          answers_json: Record<string, unknown>
          attempted_at: string
        }
        Insert: Omit<Database['public']['Tables']['quiz_attempts']['Row'], 'id' | 'attempted_at'>
        Update: Partial<Database['public']['Tables']['quiz_attempts']['Insert']>
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          cert_uuid: string
          issued_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'>
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>
      }
      discussions: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          parent_id: string | null
          body: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['discussions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['discussions']['Insert']>
      }
      payments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          provider: string
          provider_ref: string
          amount: number
          currency: string
          status: PaymentStatus
          paid_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      media_files: {
        Row: {
          id: string
          owner_id: string
          course_id: string | null
          r2_key: string
          size_bytes: number
          mime: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['media_files']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['media_files']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
