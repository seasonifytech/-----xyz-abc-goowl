export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      community_answers: {
        Row: {
          id: string
          question_id: string
          answer: string
          created_at: string
          upvotes: number
        }
        Insert: {
          id?: string
          question_id: string
          answer: string
          created_at?: string
          upvotes?: number
        }
        Update: {
          id?: string
          question_id?: string
          answer?: string
          created_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          }
        ]
      }
      framework_templates: {
        Row: {
          id: string
          framework_id: string
          step_key: string
          title: string
          prompt: string
          starting_template: string | null
          order_number: number
        }
        Insert: {
          id?: string
          framework_id: string
          step_key: string
          title: string
          prompt: string
          starting_template?: string | null
          order_number: number
        }
        Update: {
          id?: string
          framework_id?: string
          step_key?: string
          title?: string
          prompt?: string
          starting_template?: string | null
          order_number?: number
        }
        Relationships: []
      }
      interview_questions: {
        Row: {
          id: string
          question: string
          category: string | null
          difficulty: string | null
          created_at: string | null
          created_by: string | null
          views: number | null
          answer_count: number | null
          job_role: string | null
          company: string | null
          answer_brief: string | null
          prompt_answer: string | null
        }
        Insert: {
          id?: string
          question: string
          category?: string | null
          difficulty?: string | null
          created_at?: string | null
          created_by?: string | null
          job_role?: string | null
          company?: string | null
          answer_brief?: string | null
          prompt_answer?: string | null
        }
        Update: {
          id?: string
          question?: string
          category?: string | null
          difficulty?: string | null
          created_at?: string | null
          created_by?: string | null
          job_role?: string | null
          company?: string | null
          answer_brief?: string | null
          prompt_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}