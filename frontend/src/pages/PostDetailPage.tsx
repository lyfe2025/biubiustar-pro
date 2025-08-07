import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  ArrowLeft,
  Send,
  Smile,
  Image as ImageIcon,
  Calendar,
  Eye,
  Flag,
  Edit,
  Trash2
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar: string
  }
  createdAt: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface Post {
  id: string
  content: string
  images?: string[]
  author: {
    id: string
    username: string
    avatar: string
    isFollowing: boolean
  }
  createdAt: string
  likes: number
  comments: number
  shares: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const dateLocale = i18n.language === 'zh-CN' ? zhCN : enUS

  // 模拟获取帖子数据
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPost: Post = {
        id: id || '1',
        content: '今天在越南胡志明市的咖啡店里发现了一个超棒的工作空间！这里的咖啡香气浓郁，环境安静舒适，非常适合远程办公。分享给大家一些我在这里工作的照片和心得体会。\n\n#远程办公 #越南生活 #咖啡文化 #数字游民',
        images: [
          'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20coffee%20shop%20interior%20with%20laptop%20and%20coffee%20cup%20on%20wooden%20table%2C%20warm%20lighting%2C%20cozy%20atmosphere&image_size=landscape_4_3',
          'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=vietnamese%20coffee%20drip%20filter%20with%20condensed%20milk%2C%20traditional%20style%2C%20close%20up%20shot&image_size=square',
          'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=laptop%20screen%20showing%20code%20editor%20in%20coffee%20shop%20setting%2C%20productivity%20workspace&image_size=landscape_4_3'
        ],
        author: {
          id: '1',
          username: 'digital_nomad_vn',
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20asian%20person%20avatar%2C%20friendly%20smile%2C%20modern%20style&image_size=square',
          isFollowing: false
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 128,
        comments: 23,
        shares: 15,
        views: 1250,
        isLiked: false,
        isBookmarked: false,
        tags: ['远程办公', '越南生活', '咖啡文化', '数字游民']
      }
      
      const mockComments: Comment[] = [
        {
          id: '1',
          content: '这个地方看起来真的很棒！请问具体地址在哪里？我下次去胡志明市也想去试试。',
          author: {
            id: '2',
            username: 'coffee_lover_2024',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=young%20woman%20avatar%2C%20casual%20style%2C%20friendly%20expression&image_size=square'
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes: 5,
          isLiked: false
        },
        {
          id: '2',
          content: '作为一个在胡志明市生活了3年的人，我可以推荐几个类似的好地方！',
          author: {
            id: '3',
            username: 'saigon_local',
            avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=middle%20aged%20man%20avatar%2C%20glasses%2C%20professional%20look&image_size=square'
          },
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          likes: 12,
          isLiked: true
        }
      ]
      
      setPost(mockPost)
      setComments(mockComments)
      setLoading(false)
    }

    fetchPost()
  }, [id])

  const handleLike = () => {
    if (!post) return
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1
    })
  }

  const handleBookmark = () => {
    if (!post) return
    setPost({
      ...post,
      isBookmarked: !post.isBookmarked
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post?.author.username} 的帖子`,
        text: post?.content,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // 这里可以添加一个提示
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmittingComment(true)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: user.id,
        username: user.username,
        avatar: user.avatar_url || '/default-avatar.png'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }
    
    setComments([comment, ...comments])
    setNewComment('')
    setIsSubmittingComment(false)
    
    // 更新帖子评论数
    if (post) {
      setPost({ ...post, comments: post.comments + 1 })
    }
  }

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        }
      }
      return comment
    }))
  }

  const handleFollow = () => {
    if (!post) return
    setPost({
      ...post,
      author: {
        ...post.author,
        isFollowing: !post.author.isFollowing
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('post.notFound')}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{t('post.detail')}</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Post */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              {/* Post Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                        <span className="mx-2">•</span>
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{post.views.toLocaleString()} {t('post.views')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user && user.id !== post.author.id && (
                      <button
                        onClick={handleFollow}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          post.author.isFollowing
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {post.author.isFollowing ? t('profile.following') : t('profile.follow')}
                      </button>
                    )}
                    <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2 md:grid-cols-3'
                    }`}>
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.shares}</span>
                    </button>
                  </div>
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-colors ${
                      post.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('post.comments')} ({comments.length})
                </h2>

                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="flex space-x-3">
                      <img
                        src={user.avatar_url || '/default-avatar.png'}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={t('post.writeComment')}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                              <Smile className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                              <ImageIcon className="w-5 h-5" />
                            </button>
                          </div>
                          <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            <span>{isSubmittingComment ? t('post.submitting') : t('post.submit')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-600 mb-4">{t('post.loginToComment')}</p>
                    <button
                      onClick={() => {/* 这里应该打开登录弹窗 */}}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {t('auth.login')}
                    </button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{comment.author.username}</h4>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center space-x-1 text-sm transition-colors ${
                              comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                            {t('post.reply')}
                          </button>
                          <button className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('post.relatedPosts')}</h3>
              <div className="space-y-4">
                {/* 这里可以添加相关帖子 */}
                <p className="text-gray-500 text-sm">{t('post.noRelatedPosts')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}