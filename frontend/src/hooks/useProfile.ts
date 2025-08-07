import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import {
  Post,
  UserProfile,
  Draft,
  Achievement,
  Notification,
  Analytics,
  ActivityStats,
  TabType,
  FilterType
} from '../types/profile'
import { generateFileName } from '../utils/profileUtils'

export const useProfile = (userId?: string) => {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    weeklyGrowth: 0,
    topPost: null
  })
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [publishHistory, setPublishHistory] = useState<Post[]>([])
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    dailyPosts: 0,
    weeklyEngagement: 0,
    monthlyGrowth: 0
  })

  const isOwnProfile = user?.id === userId || (!userId && user)
  const currentUserId = userId || user?.id

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single()

      if (error) throw error
      setProfile(data)
      
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

  const fetchPosts = async (activeTab: TabType) => {
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
          title: '未完成的想法',
          content: '这是一个还在编辑中的草稿...',
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
      const mockFollowers: UserProfile[] = [
        {
          id: 'follower1',
          username: 'follower_user1',
          email: 'follower1@example.com',
          avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait&image_size=square',
          bio: '热爱分享的用户',
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
      const mockFollowing: UserProfile[] = [
        {
          id: 'following1',
          username: 'following_user1',
          email: 'following1@example.com',
          avatar_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20artist%20avatar&image_size=square',
          bio: '创意设计师',
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
      const mockAchievements: Achievement[] = [
        {
          id: 'achievement1',
          title: '首次发帖',
          description: '发布了第一篇内容',
          icon: '🎉',
          progress: 1,
          total: 1,
          unlocked: true,
          unlocked_at: new Date().toISOString()
        },
        {
          id: 'achievement2',
          title: '人气新星',
          description: '获得了100个点赞',
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
      setActivityStats({
        dailyPosts: 2,
        weeklyEngagement: 85,
        monthlyGrowth: 15
      })
    } catch (error) {
      console.error('Error fetching activity stats:', error)
    }
  }

  const handleSaveProfile = async (editForm: { username: string; bio: string }) => {
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
      toast.success('Profile updated successfully')
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      return false
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

  const handleAvatarUpload = async (file: File) => {
    try {
      setLoading(true)
      
      const fileName = generateFileName(user?.id || '', file.name)
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)
      
      if (updateError) throw updateError
      
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl })
      }
      
      toast.success('头像更新成功')
      return true
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('头像上传失败，请重试')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handlePublishDraft = async (draftId: string) => {
    try {
      const draft = drafts.find(d => d.id === draftId)
      if (!draft) return
      
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', draftId)
      
      if (error) throw error
      
      setDrafts(drafts.filter(d => d.id !== draftId))
      
      const newPost: Post = {
        ...draft,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0
      }
      setPosts([newPost, ...posts])
      
      toast.success('草稿发布成功')
    } catch (error) {
      console.error('Error publishing draft:', error)
      toast.error('发布失败，请重试')
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
      toast.success('草稿删除成功')
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast.error('删除失败，请重试')
    }
  }

  return {
    // State
    profile,
    posts,
    loading,
    isFollowing,
    notifications,
    unreadCount,
    analytics,
    drafts,
    publishHistory,
    followers,
    followingUsers,
    achievements,
    activityStats,
    isOwnProfile,
    currentUserId,
    
    // Actions
    fetchProfile,
    fetchPosts,
    fetchNotifications,
    fetchAnalytics,
    fetchDrafts,
    fetchPublishHistory,
    fetchFollowers,
    fetchFollowing,
    fetchAchievements,
    fetchActivityStats,
    handleSaveProfile,
    handleFollow,
    handleBookmarkPost,
    handleDeletePost,
    handleAvatarUpload,
    handlePublishDraft,
    handleDeleteDraft,
    
    // Setters
    setProfile,
    setPosts,
    setLoading
  }
}