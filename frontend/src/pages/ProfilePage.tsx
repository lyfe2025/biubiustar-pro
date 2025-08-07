import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import {
  User,
  Edit,
  Camera,
  MapPin,
  Calendar,
  Link as LinkIcon,
  UserPlus,
  UserMinus,
  Grid3X3,
  List,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Bell,
  Settings,
  TrendingUp,
  Users,
  Shield,
  Lock,
  Mail,
  Key,
  Download,
  Filter,
  Search,
  Archive,
  Star,
  Award,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  UserX,
  MessageSquare,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Save
} from 'lucide-react'

interface Post {
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

interface UserProfile {
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

interface Draft {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  total: number
  unlocked: boolean
  unlocked_at?: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'bookmarks' | 'drafts' | 'history' | 'followers' | 'following' | 'achievements' | 'settings' | 'analytics' | 'messages'>('posts')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', bio: '' })
  const [isFollowing, setIsFollowing] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    weeklyGrowth: 0,
    topPost: null as Post | null
  })
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [publishHistory, setPublishHistory] = useState<Post[]>([])
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'likes' | 'comments' | 'follows'>('all')
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activityStats, setActivityStats] = useState({
    dailyPosts: 0,
    weeklyEngagement: 0,
    monthlyGrowth: 0
  })
  
  const isOwnProfile = user?.id === userId || (!userId && user)
  const currentUserId = userId || user?.id

  // Utility function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (currentUserId) {
      fetchProfile()
      fetchPosts()
      if (isOwnProfile) {
        fetchNotifications()
        fetchAnalytics()
        fetchDrafts()
        fetchPublishHistory()
        fetchAchievements()
        fetchActivityStats()
      }
      if (activeTab === 'followers') {
        fetchFollowers()
      } else if (activeTab === 'following') {
        fetchFollowing()
      }
    }
  }, [currentUserId, activeTab])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single()

      if (error) throw error
      setProfile(data)
      setEditForm({ username: data.username || '', bio: data.bio || '' })
      
      // Check if following (only if not own profile)
      if (!isOwnProfile && user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', currentUserId)
          .single()
        
        setIsFollowing(!!followData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(username, avatar_url)
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (activeTab === 'likes') {
        query = supabase
          .from('post_likes')
          .select(`
            posts(
              *,
              profiles!posts_user_id_fkey(username, avatar_url)
            )
          `)
          .eq('user_id', currentUserId)
      } else if (activeTab === 'bookmarks') {
        query = supabase
          .from('bookmarks')
          .select(`
            posts(
              *,
              profiles!posts_user_id_fkey(username, avatar_url)
            )
          `)
          .eq('user_id', currentUserId)
      }

      const { data, error } = await query
      if (error) throw error

      let processedPosts = data || []
      if (activeTab === 'likes' || activeTab === 'bookmarks') {
        processedPosts = data?.map(item => item.posts).filter(Boolean) || []
      }

      setPosts(processedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count, views_count')
        .eq('user_id', user?.id)

      if (error) throw error
      
      const totalViews = postsData?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0
      const totalLikes = postsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0
      const totalComments = postsData?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0
      const totalShares = postsData?.reduce((sum, post) => sum + (post.shares_count || 0), 0) || 0
      
      setAnalytics({
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        weeklyGrowth: 12.5, // Mock data
        topPost: posts[0] || null
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchDrafts = async () => {
    try {
      // 模拟获取草稿数据
      const mockDrafts: Draft[] = [
        {
          id: 'draft1',
          title: t('profile.draftTitle1', '未完成的想法'),
          content: t('profile.draftContent1', '这是一个还在编辑中的草稿...'),
          created_at: new Date().toISOString(),
          user_id: currentUserId || ''
        }
      ]
      setDrafts(mockDrafts)
    } catch (error) {
      console.error('Error fetching drafts:', error)
    }
  }

  const fetchPublishHistory = async () => {
    try {
      // 获取发布历史（已发布的帖子按时间排序）
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', profile?.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setPublishHistory(data || [])
    } catch (error) {
      console.error('Error fetching publish history:', error)
    }
  }

  const fetchFollowers = async () => {
    try {
      // 模拟获取粉丝列表
      const mockFollowers: UserProfile[] = [
        {
          id: 'follower1',
          username: 'follower_user1',
          email: 'follower1@example.com',
          avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait&image_size=square',
          bio: t('profile.followerBio1', '热爱分享的用户'),
          posts_count: 25,
          followers_count: 150,
          following_count: 80,
          created_at: new Date().toISOString()
        }
      ]
      setFollowers(mockFollowers)
    } catch (error) {
      console.error('Error fetching followers:', error)
    }
  }

  const fetchFollowing = async () => {
    try {
      // 模拟获取关注列表
      const mockFollowing: UserProfile[] = [
        {
          id: 'following1',
          username: 'following_user1',
          email: 'following1@example.com',
          avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20artist%20avatar&image_size=square',
          bio: t('profile.followingBio1', '创意设计师'),
          posts_count: 120,
          followers_count: 500,
          following_count: 200,
          created_at: new Date().toISOString()
        }
      ]
      setFollowingUsers(mockFollowing)
    } catch (error) {
      console.error('Error fetching following:', error)
    }
  }

  const fetchAchievements = async () => {
    try {
      // 模拟获取成就数据
      const mockAchievements: Achievement[] = [
        {
          id: 'achievement1',
          title: t('profile.achievement1', '首次发帖'),
          description: t('profile.achievementDesc1', '发布了第一篇内容'),
          icon: '🎉',
          progress: 1,
          total: 1,
          unlocked: true,
          unlocked_at: new Date().toISOString()
        },
        {
          id: 'achievement2',
          title: t('profile.achievement2', '人气新星'),
          description: t('profile.achievementDesc2', '获得了100个点赞'),
          icon: '⭐',
          progress: 100,
          total: 100,
          unlocked: true,
          unlocked_at: new Date().toISOString()
        }
      ]
      setAchievements(mockAchievements)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchActivityStats = async () => {
    try {
      // 模拟获取活跃度统计
      setActivityStats({
        dailyPosts: 2,
        weeklyEngagement: 85,
        monthlyGrowth: 15
      })
    } catch (error) {
      console.error('Error fetching activity stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          bio: editForm.bio
        })
        .eq('id', user?.id)

      if (error) throw error
      
      setProfile(prev => prev ? { ...prev, ...editForm } : null)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleFollow = async () => {
    if (!user || !currentUserId) return

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', currentUserId)

        if (error) throw error
        setIsFollowing(false)
        toast.success('Unfollowed successfully')
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: currentUserId
          })

        if (error) throw error
        setIsFollowing(true)
        toast.success('Following successfully')
      }
    } catch (error) {
      console.error('Error updating follow status:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleBookmarkPost = async (postId: string) => {
    if (!user) return

    try {
      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (existingBookmark) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)

        if (error) throw error
        toast.success('已取消收藏')
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            post_id: postId
          })

        if (error) throw error
        toast.success('已添加到收藏')
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
      toast.error('操作失败，请重试')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setPosts(prev => prev.filter(post => post.id !== postId))
      toast.success('帖子已删除')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('删除失败，请重试')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        toast.error(t('profile.invalidFileType', '请选择图片文件'))
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB限制
        toast.error(t('profile.fileTooLarge', '文件大小不能超过5MB'))
        return
      }

      setLoading(true)
      
      // 上传到Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
      
      if (error) throw error
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // 更新用户资料
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)
      
      if (updateError) throw updateError
      
      // 更新本地状态
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl })
      }
      
      toast.success(t('profile.avatarUpdated', '头像更新成功'))
      setShowAvatarUpload(false)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error(t('profile.avatarUploadError', '头像上传失败，请重试'))
    } finally {
      setLoading(false)
    }
  }

  const handlePublishDraft = async (draftId: string) => {
    try {
      const draft = drafts.find(d => d.id === draftId)
      if (!draft) return
      
      // 发布草稿逻辑
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', draftId)
      
      if (error) throw error
      
      // 从草稿列表中移除
      setDrafts(drafts.filter(d => d.id !== draftId))
      
      // 添加到已发布列表
      const newPost: Post = {
        ...draft,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0
      }
      setPosts([newPost, ...posts])
      
      toast.success(t('profile.draftPublished', '草稿发布成功'))
    } catch (error) {
      console.error('Error publishing draft:', error)
      toast.error(t('profile.publishError', '发布失败，请重试'))
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', draftId)
      
      if (error) throw error
      
      setDrafts(drafts.filter(d => d.id !== draftId))
      toast.success(t('profile.draftDeleted', '草稿删除成功'))
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast.error(t('profile.deleteError', '删除失败，请重试'))
    }
  }



  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt={profile.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-purple-500 outline-none bg-transparent text-center sm:text-left"
                  />
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.username}</h1>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {isOwnProfile ? (
                    isEditing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 sm:gap-2"
                        >
                          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">保存</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 sm:gap-2"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">取消</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 sm:gap-2"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">编辑资料</span>
                      </button>
                    )
                  ) : (
                    <>
                      <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 sm:gap-2">
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">关注</span>
                      </button>
                      <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 sm:gap-2">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">私信</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-4">
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="介绍一下自己..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">{profile.bio || '这个人很懒，什么都没有留下...'}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 text-sm">
                <div className="text-center sm:text-left">
                  <span className="font-semibold text-base sm:text-lg text-gray-900">{profile.posts_count || 0}</span>
                  <p className="text-gray-600 text-xs sm:text-sm">帖子</p>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-semibold text-base sm:text-lg text-gray-900">{profile.followers_count || 0}</span>
                  <p className="text-gray-600 text-xs sm:text-sm">关注者</p>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-semibold text-base sm:text-lg text-gray-900">{profile.following_count || 0}</span>
                  <p className="text-gray-600 text-xs sm:text-sm">关注中</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Drafts Content */}
        {activeTab === 'drafts' && isOwnProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">草稿箱</h2>
              <span className="text-sm text-gray-500">{drafts.length} 个草稿</span>
            </div>
            
            {drafts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无草稿</h3>
                <p className="text-gray-600">您的草稿将在这里显示</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map((draft) => (
                  <div key={draft.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{draft.title}</h3>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => handlePublishDraft(draft.id)}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          title="发布"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{draft.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>草稿</span>
                      <span>{formatDate(draft.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Publish History Content */}
        {activeTab === 'history' && isOwnProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">发布历史</h2>
              <span className="text-sm text-gray-500">{publishHistory.length} 个帖子</span>
            </div>
            
            {publishHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无发布历史</h3>
                <p className="text-gray-600">您的发布历史将在这里显示</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                  {publishHistory.map((post) => (
                    <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{post.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments_count || 0}
                            </span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <button className="ml-4 text-purple-600 hover:text-purple-700 text-sm">
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Followers Content */}
        {activeTab === 'followers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">关注者</h2>
              <span className="text-sm text-gray-500">{followers.length} 个关注者</span>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索关注者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {followers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无关注者</h3>
                <p className="text-gray-600">还没有人关注您</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.filter(follower => 
                  follower.username.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((follower) => (
                  <div key={follower.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {follower.avatar_url ? (
                          <img src={follower.avatar_url} alt={follower.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          follower.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{follower.username}</h3>
                        <p className="text-sm text-gray-500 truncate">{follower.bio || '暂无简介'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{follower.posts_count || 0} 帖子</span>
                        <span>{follower.followers_count || 0} 关注者</span>
                      </div>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        查看资料
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Following Content */}
        {activeTab === 'following' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">关注中</h2>
              <span className="text-sm text-gray-500">{followingUsers.length} 个关注</span>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索关注的用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {followingUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂未关注任何人</h3>
                <p className="text-gray-600">开始关注其他用户来查看他们的内容</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followingUsers.filter(user => 
                  user.username.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((user) => (
                  <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{user.username}</h3>
                        <p className="text-sm text-gray-500 truncate">{user.bio || '暂无简介'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{user.posts_count || 0} 帖子</span>
                        <span>{user.followers_count || 0} 关注者</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                          查看资料
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          取消关注
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
                
                {isOwnProfile ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span className="hidden sm:inline">Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Bio */}
              <div className="mb-4">
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 outline-none resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile.bio || (isOwnProfile ? 'Add a bio to tell people about yourself' : 'No bio available')}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-3 sm:gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-base sm:text-lg">{profile.posts_count || 0}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-base sm:text-lg">{profile.followers_count || 0}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-base sm:text-lg">{profile.following_count || 0}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 min-w-max">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'posts'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('profile.posts', '帖子')}</span>
                  <span className="sm:hidden">帖子</span>
                </button>
                <button
                  onClick={() => setActiveTab('likes')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'likes'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('profile.likes', '点赞')}</span>
                  <span className="sm:hidden">点赞</span>
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'bookmarks'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('profile.bookmarks', '收藏')}</span>
                  <span className="sm:hidden">收藏</span>
                </button>
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setActiveTab('drafts')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors relative whitespace-nowrap ${
                      activeTab === 'drafts'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('profile.drafts', '草稿箱')}</span>
                    <span className="sm:hidden">草稿</span>
                    {drafts.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {drafts.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'history'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('profile.history', '发布历史')}</span>
                    <span className="sm:hidden">历史</span>
                  </button>
                </>
              )}
                <button
                  onClick={() => setActiveTab('followers')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'followers'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('profile.followers', '关注者')}</span>
                  <span className="sm:hidden">粉丝</span>
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'following'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('profile.following', '关注中')}</span>
                  <span className="sm:hidden">关注</span>
                </button>
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'achievements'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('profile.achievements', '成就')}</span>
                    <span className="sm:hidden">成就</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'analytics'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('profile.analytics', '数据分析')}</span>
                    <span className="sm:hidden">分析</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors relative whitespace-nowrap ${
                      activeTab === 'messages'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('profile.messages', '消息通知')}</span>
                    <span className="sm:hidden">消息</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'settings'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('profile.settings', '设置')}</span>
                    <span className="sm:hidden">设置</span>
                  </button>
                </>
              )}
            </div>
            
            {(activeTab === 'posts' || activeTab === 'likes' || activeTab === 'bookmarks') && (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Posts Content */}
        {(activeTab === 'posts' || activeTab === 'likes' || activeTab === 'bookmarks') && (
          <div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Grid3X3 className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'posts' ? '还没有发布任何内容' : 
                   activeTab === 'likes' ? '还没有点赞任何内容' : '还没有收藏任何内容'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'posts' && isOwnProfile ? '开始分享您的第一个帖子吧！' : 
                   '当有内容时，会在这里显示。'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}>
                {posts.map((post) => (
                  <div key={post.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                  }`}>
                    {/* Post Image */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className={viewMode === 'list' ? 'w-full sm:w-48 h-48 sm:h-auto flex-shrink-0' : 'aspect-square'}>
                        <img
                          src={post.image_urls[0]}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Post Content */}
                    <div className="p-3 sm:p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{post.title}</h3>
                        <button 
                          onClick={() => handleBookmarkPost(post.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.content}</p>
                      
                      {/* Post Stats */}
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-1 hover:text-purple-600 cursor-pointer transition-colors">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{post.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-purple-600 cursor-pointer transition-colors">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{post.comments_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-purple-600 cursor-pointer transition-colors">
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{post.shares_count || 0}</span>
                          </div>
                          {viewMode === 'list' && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{post.views_count || 0}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="hidden sm:inline">{formatDate(post.created_at)}</span>
                          <span className="sm:hidden text-xs">{formatDate(post.created_at).split(' ')[0]}</span>
                          {isOwnProfile && (
                            <div className="relative">
                              <button
                                onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              >
                                <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              {showPostMenu === post.id && (
                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                  <button
                                    onClick={() => {
                                      setSelectedPost(post)
                                      setShowCreatePost(true)
                                      setShowPostMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeletePost(post.id)
                                      setShowPostMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Content */}
        {activeTab === 'analytics' && isOwnProfile && (
          <div className="space-y-4 sm:space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">总浏览量</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">总点赞数</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalLikes.toLocaleString()}</p>
                  </div>
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </div>
              <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">总评论数</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalComments.toLocaleString()}</p>
                  </div>
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">总分享数</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalShares.toLocaleString()}</p>
                  </div>
                  <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">内容表现趋势</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">图表占位符 - 可集成 Chart.js 或 Recharts</p>
              </div>
            </div>

            {/* Top Content */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">热门内容</h3>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-600">{post.views_count || 0} 浏览</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.likes_count || 0} 点赞</span>
                      <span>{post.comments_count || 0} 评论</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Content */}
        {activeTab === 'messages' && isOwnProfile && (
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button className="flex-1 py-2 px-4 text-sm font-medium text-white bg-purple-600 rounded-md">
                全部
              </button>
              <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900">
                点赞
              </button>
              <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900">
                评论
              </button>
              <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900">
                关注
              </button>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">消息通知</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700">
                  标记全部为已读
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">暂无新消息</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Bell className="w-4 h-4 text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Content */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">成就系统</h2>
              <span className="text-sm text-gray-500">{achievements.length} 个成就</span>
            </div>
            
            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">总成就</p>
                    <p className="text-2xl font-bold">{achievements.length}</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">活跃度</p>
                    <p className="text-2xl font-bold">{activityStats.weeklyEngagement}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">本月增长</p>
                    <p className="text-2xl font-bold">+{activityStats.monthlyGrowth}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </div>
            </div>
            
            {/* Achievements Grid */}
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无成就</h3>
                <p className="text-gray-600">继续活跃来解锁更多成就</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.unlocked && (
                          <p className="text-xs text-green-600 mt-1">已解锁 • {formatDate(achievement.unlocked_at)}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>进度</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            achievement.unlocked ? 'bg-yellow-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min((achievement.progress / achievement.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Activity Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">活跃度统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{activityStats.dailyPosts}</p>
                  <p className="text-sm text-gray-600">今日发帖</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{activityStats.weeklyEngagement}%</p>
                  <p className="text-sm text-gray-600">本周互动率</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">+{activityStats.monthlyGrowth}%</p>
                  <p className="text-sm text-gray-600">月度增长</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Content */}
        {activeTab === 'settings' && isOwnProfile && (
          <div className="space-y-6">
            {/* Privacy Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">隐私设置</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">公开资料</p>
                    <p className="text-sm text-gray-600">允许其他用户查看您的个人资料</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">显示在线状态</p>
                    <p className="text-sm text-gray-600">让其他用户知道您何时在线</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">新关注者</p>
                    <p className="text-sm text-gray-600">有人关注您时接收通知</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">点赞和评论</p>
                    <p className="text-sm text-gray-600">有人点赞或评论您的内容时接收通知</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">邮件通知</p>
                    <p className="text-sm text-gray-600">通过邮件接收重要通知</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">账户设置</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">更改密码</p>
                  <p className="text-sm text-gray-600">更新您的登录密码</p>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">邮箱设置</p>
                  <p className="text-sm text-gray-600">管理您的邮箱地址</p>
                </button>
                <button 
                  onClick={() => navigate('/security-logs')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">安全日志</p>
                  <p className="text-sm text-gray-600">查看账户安全活动记录</p>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors">
                  <p className="font-medium text-red-600">删除账户</p>
                  <p className="text-sm text-red-500">永久删除您的账户和所有数据</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Button (Only for own profile) */}
      {isOwnProfile && (
        <button
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">创建新帖子</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6">
                {/* Post Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标题
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="输入帖子标题..."
                  />
                </div>

                {/* Post Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    内容
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="分享您的想法..."
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添加媒体
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">点击上传或拖拽文件到此处</p>
                    <div className="flex justify-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        图片
                      </span>
                      <span className="flex items-center">
                        <Video className="w-4 h-4 mr-1" />
                        视频
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        文档
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">允许评论</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">公开可见</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    发布
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage