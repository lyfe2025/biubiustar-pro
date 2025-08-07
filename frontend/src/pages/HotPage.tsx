import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Filter, Heart, MessageCircle, Share2, Search, ArrowUp, SortDesc, Tag, User, Calendar, Eye, Bookmark, X, RefreshCw, Hash } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import PostSkeleton from '../components/PostSkeleton'
import HighlightText from '../components/HighlightText'
import { toast } from 'sonner'

export default function HotPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'likes' | 'comments' | 'time' | 'views'>('likes')
  const [postType, setPostType] = useState<'all' | 'text' | 'image' | 'video'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { user } = useAuthStore()

  // 热门标签
  const popularTags = ['科技', '生活', '美食', '旅行', '摄影', '音乐', '电影', '游戏', '健身', '学习']

  useEffect(() => {
    document.title = 'Biubiustar - 热门'
    fetchPosts(true)
  }, [filter, sortBy, postType, searchQuery, selectedTags])

  // 滚动监听 - 回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 搜索防抖
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchPosts(true)
      }
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // 无限滚动监听
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, loadingMore])

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setHasMore(true)
      }
      
      const currentPage = reset ? 0 : page
      const pageSize = 10
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          users:user_id (
            id,
            username,
            avatar_url
          )
        `, { count: 'exact' })

      // 搜索功能
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      // 根据时间过滤
      if (filter !== 'all') {
        const now = new Date()
        let startDate: Date
        
        switch (filter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            startDate = new Date(0)
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      // 根据类型过滤
      if (postType !== 'all') {
        switch (postType) {
          case 'text':
            query = query.is('image_urls', null).is('video_url', null)
            break
          case 'image':
            query = query.not('image_urls', 'is', null)
            break
          case 'video':
            query = query.not('video_url', 'is', null)
            break
        }
      }

      // 标签筛选
      if (selectedTags.length > 0) {
        // 假设posts表有tags字段，包含标签数组
        const tagConditions = selectedTags.map(tag => `tags.cs.{"${tag}"}`).join(',')
        query = query.or(tagConditions)
      }

      // 排序
      switch (sortBy) {
        case 'likes':
          query = query.order('likes_count', { ascending: false })
          break
        case 'comments':
          query = query.order('comments_count', { ascending: false })
          break
        case 'views':
          query = query.order('views_count', { ascending: false })
          break
        case 'time':
          query = query.order('created_at', { ascending: false })
          break
      }
      
      query = query.order('created_at', { ascending: false })
      query = query.range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)

      const { data, error, count } = await query

      if (error) throw error
      
      const newPosts = data || []
      
      if (reset) {
        setPosts(newPosts)
        setTotalCount(count || 0)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      // 检查是否还有更多数据
      if (newPosts.length < pageSize) {
        setHasMore(false)
      }
      
      if (!reset) {
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error('获取热门内容失败:', error)
      toast.error('获取热门内容失败')
      if (reset) {
        setLoadError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      setLoadError(false)
      await fetchPosts(false)
      setRetryCount(0)
    } catch (error) {
      console.error('加载更多失败:', error)
      setLoadError(true)
      setRetryCount(prev => prev + 1)
    } finally {
      setLoadingMore(false)
    }
  }, [page, filter, loadingMore, hasMore])

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 检查是否已点赞
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (existingLike) {
        // 取消点赞
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1 }
            : post
        ))
      } else {
        // 添加点赞
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId })
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ))
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      toast.error('操作失败')
    }
  }

  const handleBookmark = async (postId: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 检查是否已收藏
      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (existingBookmark) {
        // 取消收藏
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        
        toast.success('已取消收藏')
      } else {
        // 添加收藏
        await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, post_id: postId })
        
        toast.success('收藏成功')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      toast.error('操作失败')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 30) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowSearchHistory(false)
    
    // 添加到搜索历史
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 4)]
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }
  }

  // 加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 点击外部关闭搜索历史
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchHistory(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 处理标签选择
  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // 重试加载
  const handleRetry = () => {
    if (posts.length === 0) {
      fetchPosts(true)
    } else {
      loadMorePosts()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('hot.title')}</h1>
          {totalCount > 0 && (
            <span className="text-sm text-gray-500 ml-2">({totalCount} 条内容)</span>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('hot.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery)
                }
              }}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Search History Dropdown */}
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t('hot.search.history')}</span>
                    <button
                      onClick={() => {
                        setSearchHistory([])
                        localStorage.removeItem('searchHistory')
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {t('hot.search.clear')}
                    </button>
                  </div>
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item)
                      setShowSearchHistory(false)
                      handleSearch(item)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-gray-400" />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
        <div className="space-y-4">
          <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-4">
            {/* Time Filter */}
            <div className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
              <label className="block text-xs font-medium text-gray-700 md:hidden">{t('hot.filters.time')}</label>
              <Calendar className="hidden md:block w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 md:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('hot.filter.all')}</option>
                <option value="today">{t('hot.filter.today')}</option>
                <option value="week">{t('hot.filter.week')}</option>
                <option value="month">{t('hot.filter.month')}</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
              <label className="block text-xs font-medium text-gray-700 md:hidden">{t('hot.filters.sort')}</label>
              <SortDesc className="hidden md:block w-4 h-4 text-gray-500" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 md:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="likes">{t('hot.sort.mostLiked')}</option>
                <option value="comments">{t('hot.sort.mostCommented')}</option>
                <option value="views">按浏览数</option>
                <option value="time">{t('hot.sort.latest')}</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
              <label className="block text-xs font-medium text-gray-700 md:hidden">{t('hot.filters.type')}</label>
              <Filter className="hidden md:block w-4 h-4 text-gray-500" />
              <select 
                value={postType} 
                onChange={(e) => setPostType(e.target.value as any)}
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 md:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('hot.type.all')}</option>
                <option value="text">{t('hot.type.article')}</option>
                <option value="image">{t('hot.type.image')}</option>
                <option value="video">{t('hot.type.video')}</option>
              </select>
            </div>

            {/* Results Count */}
            {posts.length > 0 && (
              <div className="w-full md:w-auto">
                <span className="text-xs md:text-sm text-gray-500">
                  {searchQuery || filter !== 'all' || postType !== 'all' || selectedTags.length > 0 ? (
                    t('hot.results.filtered', { count: posts.length })
                  ) : (
                    t('hot.results.count', { count: posts.length })
                  )}
                </span>
              </div>
            )}

            {/* Clear Filters */}
            {(filter !== 'all' || sortBy !== 'likes' || postType !== 'all' || searchQuery || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setFilter('all')
                  setSortBy('likes')
                  setPostType('all')
                  setSearchQuery('')
                  setSelectedTags([])
                }}
                className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium px-2 py-1 rounded hover:bg-purple-50 transition-colors touch-manipulation"
              >
                {t('hot.actions.clearFilters')}
              </button>
            )}
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{t('hot.tags.hotTags')}:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1.5 md:py-1 text-xs md:text-sm rounded-full border transition-colors touch-manipulation ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && posts.length === 0 && (
        <div className="space-y-6">
          <PostSkeleton count={5} />
        </div>
      )}

      {/* Error State */}
      {loadError && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('hot.error.loadFailed')}</h3>
          <p className="text-gray-500 mb-4">{t('hot.error.networkError')}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('hot.actions.retry')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('hot.empty.noContent')}</h3>
          <p className="text-gray-500">{t('hot.empty.suggestion')}</p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
              <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0">
                  #{index + 1} 热门
                </span>
                <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
                  <img
                    src={post.users?.avatar_url || '/default-avatar.png'}
                    alt={post.users?.username || 'User'}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-purple-100 transition-all flex-shrink-0"
                  />
                  <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors truncate">@{post.users?.username || 'Anonymous'}</span>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap hidden sm:inline">{formatDate(post.created_at)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye className="w-3 h-3" />
                  <span>{post.views_count || Math.floor(Math.random() * 1000) + 100}</span>
                </div>
                
                {/* Quick Actions - Show on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                  <button
                     onClick={() => handleLike(post.id)}
                     className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                       post.user_has_liked 
                         ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-red-500'
                     }`}
                     title={t('hot.actions.quickActions')}
                   >
                     <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                   </button>
                   
                   <button
                     onClick={() => handleBookmark(post.id)}
                     className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                       post.user_has_bookmarked 
                         ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-yellow-500'
                     }`}
                     title={t('hot.actions.quickActions')}
                   >
                     <Bookmark className={`w-4 h-4 ${post.user_has_bookmarked ? 'fill-current' : ''}`} />
                   </button>
                  
                  <button
                    className="p-2 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                    title={t('hot.actions.share')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-3 md:mb-4 cursor-pointer" onClick={() => window.open(`/post/${post.id}`, '_blank')}>
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
                <HighlightText text={post.title} searchQuery={searchQuery} />
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors">
                  <HighlightText text={post.content} searchQuery={searchQuery} />
                </p>
              
              {/* Images */}
              {post.image_urls && post.image_urls.length > 0 && (
                <div className="mt-3 md:mt-4">
                  {post.image_urls.length === 1 ? (
                    <div className="relative overflow-hidden rounded-md md:rounded-lg group/image">
                      <img
                        src={post.image_urls[0]}
                        alt="Post image"
                        className="w-full max-w-sm md:max-w-md h-auto object-cover transition-transform duration-300 group-hover/image:scale-105 cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <Eye className="w-5 h-5 md:w-6 md:h-6 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
                      {post.image_urls.slice(0, 6).map((image, imgIndex) => (
                        <div key={imgIndex} className="relative overflow-hidden rounded-md md:rounded-lg group/image">
                          <img
                            src={image}
                            alt={`Post image ${imgIndex + 1}`}
                            className="w-full h-24 md:h-32 object-cover transition-transform duration-300 group-hover/image:scale-105 cursor-pointer"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                            <Eye className="w-3 h-3 md:w-4 md:h-4 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                          </div>
                          {imgIndex === 5 && post.image_urls.length > 6 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-md md:rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-sm md:text-lg">+{post.image_urls.length - 6}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Video */}
              {post.video_url && (
                <div className="mt-3 md:mt-4">
                  <div className="relative overflow-hidden rounded-md md:rounded-lg group/video">
                    <video
                      src={post.video_url}
                      controls
                      className="w-full max-w-sm md:max-w-md h-auto transition-transform duration-300 group-hover/video:scale-105"
                      poster={post.video_thumbnail}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/video:bg-opacity-5 transition-all duration-300 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 gap-2">
              <div className="flex items-center gap-3 md:gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 rounded-full transition-all duration-200 touch-manipulation ${
                    post.user_liked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${post.user_liked ? 'fill-current' : ''}`} />
                  <span className="text-xs md:text-sm font-medium">{post.likes_count}</span>
                </button>
                
                <button 
                  className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 touch-manipulation"
                  onClick={() => window.open(`/post/${post.id}#comments`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-medium">{post.comments_count}</span>
                </button>
                
                <button className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-manipulation">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-medium hidden sm:inline">{t('hot.actions.share')}</span>
                </button>
              </div>
              
              {/* Post Type Badge */}
              <div className="flex items-center gap-1.5 md:gap-2 text-xs text-gray-400">
                {post.image_urls && post.image_urls.length > 0 && (
                  <span className="px-1.5 md:px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {t('hot.types.image')}
                  </span>
                )}
                {post.video_url && (
                  <span className="px-1.5 md:px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                    {t('hot.types.video')}
                  </span>
                )}
                <button className="opacity-0 group-hover:opacity-100 text-xs text-purple-600 hover:text-purple-700 font-medium px-1.5 md:px-2 py-1 rounded border border-purple-200 hover:bg-purple-50 transition-all hidden md:inline-block">
                  {t('hot.actions.quickPreview')}
                </button>
              </div>
            </div>
          </div>
        ))}
           
        {/* Load More Trigger */}
        {!loading && posts.length > 0 && hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loadingMore ? (
              <div className="py-6">
                <PostSkeleton count={2} />
              </div>
            ) : loadError && retryCount > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-sm text-gray-500 mb-2">{t('hot.error.loadMoreFailed')}</div>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('hot.actions.retry')} ({retryCount}/3)
                </button>
              </div>
            ) : (
              <button
                onClick={loadMorePosts}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {t('hot.actions.loadMore')}
              </button>
            )}
          </div>
        )}

        {/* No More Content */}
        {!loading && posts.length > 0 && !hasMore && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">{t('hot.loading.noMore')}</div>
          </div>
        )}
       </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 animate-bounce"
          title={t('hot.actions.backToTop')}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
     </div>
   )
 }