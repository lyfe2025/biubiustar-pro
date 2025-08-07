export interface Post {
  id: string
  title: string
  content: string
  image_urls?: string[]
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  created_at: string
  user_id: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
}

export interface Draft {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  total: number
  unlocked: boolean
  unlocked_at?: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface Analytics {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  weeklyGrowth: number
  topPost: Post | null
}

export interface ActivityStats {
  dailyPosts: number
  weeklyEngagement: number
  monthlyGrowth: number
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgEngagement: number
  peakHour: number
  activeHours: number[]
  weeklyActivity: number[]
}

export type TabType = 'posts' | 'likes' | 'bookmarks' | 'drafts' | 'history' | 'followers' | 'following' | 'achievements' | 'settings' | 'analytics' | 'messages' | 'notifications'

export type ViewMode = 'grid' | 'list'

export type FilterType = 'all' | 'likes' | 'comments' | 'follows'