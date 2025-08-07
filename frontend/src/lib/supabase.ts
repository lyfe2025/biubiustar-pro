import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 数据库类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  followers_count: number
  following_count: number
  posts_count: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  title?: string
  content: string
  image_urls?: string[]
  video_url?: string
  likes_count: number
  comments_count: number
  shares_count: number
  is_pinned: boolean
  is_featured: boolean
  visibility: 'public' | 'private' | 'friends'
  created_at: string
  updated_at: string
  user?: User
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string
  content: string
  likes_count: number
  replies_count: number
  created_at: string
  updated_at: string
  user?: User
  replies?: Comment[]
}

export interface Like {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: User
  following?: User
}