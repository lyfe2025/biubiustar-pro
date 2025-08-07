import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, TrendingUp, Calendar, Heart, MessageCircle, Share2, Users, Star, ArrowRight, Clock, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { t } = useTranslation()
  const [hotPosts, setHotPosts] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({ users: 0, posts: 0, likes: 0 })

  // 统计数据动画函数
  const animateStats = (targetStats: { users: number; posts: number; likes: number }) => {
    const duration = 2000 // 2秒动画
    const steps = 60 // 60帧
    const stepDuration = duration / steps
    
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      setStats({
        users: Math.floor(targetStats.users * progress),
        posts: Math.floor(targetStats.posts * progress),
        likes: Math.floor(targetStats.likes * progress)
      })
      
      if (currentStep >= steps) {
        clearInterval(interval)
        setStats(targetStats) // 确保最终值准确
      }
    }, stepDuration)
  }
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    document.title = 'Biubiustar - 首页'
    // 模拟数据加载
    const loadData = async () => {
      setIsLoading(true)
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      loadMockData()
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  const loadMockData = () => {
    // 模拟热门帖子数据
    const mockHotPosts = [
      {
        id: 1,
        title: '如何在2024年成为更好的开发者',
        content: '分享一些实用的技巧和经验，帮助你在新的一年里提升编程技能...',
        author: { username: 'TechGuru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
        likes_count: 234,
        comments_count: 45,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        title: 'React 18 新特性深度解析',
        content: 'React 18 带来了许多令人兴奋的新特性，让我们一起来探索...',
        author: { username: 'ReactMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
        likes_count: 189,
        comments_count: 32,
        created_at: '2024-01-14T15:20:00Z'
      },
      {
        id: 3,
        title: '设计系统的最佳实践',
        content: '构建可扩展和一致的设计系统是现代产品开发的关键...',
        author: { username: 'DesignPro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
        likes_count: 156,
        comments_count: 28,
        created_at: '2024-01-13T09:45:00Z'
      }
    ]

    // 模拟活动数据
    const mockActivities = [
      {
        id: 1,
        title: '新年编程挑战',
        description: '参与我们的30天编程挑战，提升你的编程技能，获得专属认证',
        participants: 1250,
        maxParticipants: 2000,
        endDate: '2024-02-15',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400'
      },
      {
        id: 2,
        title: '开源项目贡献月',
        description: '为开源社区做贡献，获得专属徽章和奖励，提升个人影响力',
        participants: 890,
        maxParticipants: 1000,
        endDate: '2024-01-31',
        status: 'ending',
        image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400'
      },
      {
        id: 3,
        title: '设计创意大赛',
        description: '展示你的设计才华，赢取丰厚奖品和职业发展机会',
        participants: 2100,
        maxParticipants: 2500,
        endDate: '2024-03-01',
        status: 'hot',
        image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400'
      }
    ]

    setHotPosts(mockHotPosts)
    setActivities(mockActivities)

    // 模拟统计数据动画
    animateStats({ users: 12500, posts: 8900, likes: 45600 })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${diffInHours}小时前`
    return `${Math.floor(diffInHours / 24)}天前`
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面加载动画 */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-purple-600 font-medium">加载中...</p>
          </div>
        </div>
      )}
      {/* Hero Section - 品牌展示区 */}
      <section className="text-center py-16 px-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl mx-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.title').split(' ').slice(0, -1).join(' ')}
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {' '}{t('home.title').split(' ').slice(-1)}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.subtitle')}
          </p>
          
          {/* 统计数据 */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.users.toLocaleString()}</div>
              <div className="text-sm text-gray-600">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.posts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">精彩内容</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.likes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">点赞互动</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hot"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              {t('home.startExploring')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              {t('home.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* 热门内容区 */}
      <section className="px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center animate-fade-in-up">
            <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
            热门内容
          </h2>
          <Link 
            to="/hot" 
            className="group text-purple-600 hover:text-purple-700 font-medium flex items-center transition-colors"
          >
            查看更多
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotPosts.map((post: any, index: number) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 transform hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-purple-100 rounded-full mr-3 ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-purple-600 transition-colors">{post.author.username}</p>
                    <p className="text-gray-500 text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium group-hover:bg-purple-200 transition-colors">
                  热门
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors">
                {post.content}
              </p>
              
              {/* 快速预览标签 */}
              <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">#热门</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">#推荐</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center hover:text-red-500 transition-colors cursor-pointer">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes_count}
                  </span>
                  <span className="flex items-center hover:text-blue-500 transition-colors cursor-pointer">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments_count}
                  </span>
                  <span className="flex items-center hover:text-purple-500 transition-colors cursor-pointer">
                    <Eye className="w-4 h-4 mr-1" />
                    {Math.floor(Math.random() * 1000) + 100}
                  </span>
                </div>
                <span className="flex items-center hover:text-green-500 transition-colors cursor-pointer">
                  <Share2 className="w-4 h-4 mr-1" />
                  分享
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 活动推荐区 */}
      <section className="px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center animate-fade-in-up">
            <Calendar className="w-6 h-6 mr-2 text-purple-600" />
            精彩活动
          </h2>
          <Link 
            to="/activities" 
            className="group text-purple-600 hover:text-purple-700 font-medium flex items-center transition-colors"
          >
            查看更多
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity: any, index: number) => (
            <div 
              key={activity.id} 
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* 活动状态标识 */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                  <Calendar className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  
                  {/* 活动状态徽章 */}
                  <div className="absolute top-4 left-4">
                    {activity.status === 'active' && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        进行中
                      </span>
                    )}
                    {activity.status === 'ending' && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        即将结束
                      </span>
                    )}
                    {activity.status === 'hot' && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        热门
                      </span>
                    )}
                  </div>
                  
                  {/* 参与人数徽章 */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      {activity.participants}人参与
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">{activity.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors">{activity.description}</p>
                
                {/* 参与进度条 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>参与进度</span>
                    <span>{Math.min(Math.floor((activity.participants / activity.maxParticipants) * 100), 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 group-hover:from-purple-600 group-hover:to-pink-600"
                      style={{ width: `${Math.min((activity.participants / activity.maxParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {activity.participants}/{activity.maxParticipants}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {activity.endDate}
                  </span>
                </div>
                
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 font-medium group-hover:shadow-lg transform group-hover:scale-105">
                  立即参与
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16 px-4 rounded-2xl mx-4 mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-purple-100 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <Link
            to="/hot"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {t('home.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  )
}