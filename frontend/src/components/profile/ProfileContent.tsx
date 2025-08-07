import React, { useState } from 'react';
import { Search, Heart, MessageCircle, Share, Trash2, Edit, Send, User, FileText, Calendar, Trophy, Award, Bell } from 'lucide-react';
import { TabType, ViewMode, FilterType, Post, Draft, UserProfile, Achievement, Notification } from '../../types/profile';
import { formatDate, formatNumber, getDefaultAvatarUrl } from '../../utils/profileUtils';

interface ProfileContentProps {
  activeTab: TabType;
  posts: Post[];
  drafts: Draft[];
  notifications: Notification[];
  achievements: Achievement[];
  followers: UserProfile[];
  following: UserProfile[];
  viewMode: ViewMode;
  searchQuery: string;
  filterType: FilterType;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterType) => void;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPublishDraft: (draftId: string) => void;
  onMarkNotificationRead: (notificationId: string) => void;
  isOwnProfile: boolean;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  activeTab,
  posts,
  drafts,
  notifications,
  achievements,
  followers,
  following,
  viewMode,
  searchQuery,
  filterType,
  onSearchChange,
  onFilterChange,
  onLike,
  onBookmark,
  onDelete,
  onPublishDraft,
  onMarkNotificationRead,
  isOwnProfile
}) => {
  // 添加缺少的事件处理函数
  const onComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };
  
  const onShare = (postId: string) => {
    console.log('Share post:', postId);
  };
  
  const onDeleteDraft = (draftId: string) => {
    console.log('Delete draft:', draftId);
  };
  
  const onEditDraft = (draftId: string) => {
    console.log('Edit draft:', draftId);
  };
  
  const onFollowUser = (userId: string) => {
    console.log('Follow user:', userId);
  };
  
  const onUnfollowUser = (userId: string) => {
    console.log('Unfollow user:', userId);
  };
  
  const onSendMessage = (userId: string) => {
    console.log('Send message to user:', userId);
  };
  const [searchTerm, setSearchTerm] = useState('');

  // 帖子组件
  const PostCard: React.FC<{ post: Post; showActions?: boolean }> = ({ post, showActions = true }) => (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
      viewMode === 'grid' ? 'aspect-square' : 'mb-4'
    }`}>
      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`relative ${
          viewMode === 'grid' ? 'h-full' : 'h-64'
        }`}>
          <img
            src={post.image_urls[0]}
            alt="Post image"
            className="w-full h-full object-cover"
          />
          {post.image_urls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              +{post.image_urls.length - 1}
            </div>
          )}
        </div>
      )}
      {viewMode === 'list' && (
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.content}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatDate(post.created_at)}</span>
            {showActions && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onLike(post.id)}
                  className="flex items-center gap-1 hover:text-red-500 text-gray-500"
                >
                  <Heart className="w-4 h-4" />
                  {post.likes_count}
                </button>
                <button
                  onClick={() => onComment(post.id)}
                  className="flex items-center gap-1 hover:text-blue-500"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments_count}
                </button>
                <button
                  onClick={() => onShare(post.id)}
                  className="flex items-center gap-1 hover:text-green-500"
                >
                  <Share className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // 草稿卡片组件
  const DraftCard: React.FC<{ draft: Draft }> = ({ draft }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{draft.title || '无标题草稿'}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditDraft(draft.id)}
            className="p-1 text-gray-500 hover:text-blue-500"
            title="编辑"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPublishDraft(draft.id)}
            className="p-1 text-gray-500 hover:text-green-500"
            title="发布"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteDraft(draft.id)}
            className="p-1 text-gray-500 hover:text-red-500"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{draft.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>创建时间: {formatDate(draft.created_at)}</span>
        <span>{draft.content.length} 字</span>
      </div>
    </div>
  );

  // 用户卡片组件
  const UserCard: React.FC<{ user: UserProfile; showFollowButton?: boolean }> = ({ 
    user, 
    showFollowButton = true 
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={user.avatar_url || getDefaultAvatarUrl(user.username)}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.username}
          </h3>
          <p className="text-gray-600 text-sm">@{user.username}</p>
        </div>
        {showFollowButton && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFollowUser(user.id)}
              className="px-3 py-1 text-sm rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              关注
            </button>
            <button
              onClick={() => onSendMessage(user.id)}
              className="p-1 text-gray-500 hover:text-blue-500"
              title="发送消息"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {user.bio && (
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{user.bio}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{formatNumber(user.posts_count)} 帖子</span>
        <span>{formatNumber(user.followers_count)} 关注者</span>
      </div>
    </div>
  );

  // 成就卡片组件
  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`bg-white rounded-lg border-2 p-4 ${
      achievement.unlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${
          achievement.unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {achievement.icon === 'file' && <FileText className="w-6 h-6" />}
          {achievement.icon === 'heart' && <Heart className="w-6 h-6" />}
          {achievement.icon === 'user' && <User className="w-6 h-6" />}
          {achievement.icon === 'trophy' && <Trophy className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${
            achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
          }`}>
            {achievement.title}
          </h3>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
        {achievement.unlocked && (
          <Award className="w-6 h-6 text-yellow-500" />
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'}>
          {achievement.progress}/{achievement.total}
        </span>
        {achievement.unlocked_at && (
          <span className="text-yellow-600">
            {formatDate(achievement.unlocked_at)}
          </span>
        )}
      </div>
      {!achievement.unlocked && (
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
      case 'likes':
      case 'bookmarks':
        const currentPosts = activeTab === 'posts' ? posts : 
                           activeTab === 'likes' ? posts.filter(p => p.likes_count > 0) :
                           posts.filter(p => false); // Bookmarked posts would need separate data
        
        if (currentPosts.length === 0) {
          return (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === 'posts' && '还没有发布任何帖子'}
                {activeTab === 'likes' && '还没有点赞任何帖子'}
                {activeTab === 'bookmarks' && '还没有收藏任何帖子'}
              </p>
            </div>
          );
        }
        
        return (
          <div className={viewMode === 'grid' ? 
            'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 
            'space-y-4'
          }>
            {currentPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        );

      case 'drafts':
        if (drafts.length === 0) {
          return (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">草稿箱是空的</p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map(draft => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        );

      case 'history':
        if (posts.length === 0) {
          return (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">没有发布历史</p>
            </div>
          );
        }
        
        return (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} showActions={false} />
            ))}
          </div>
        );

      case 'followers':
      case 'following':
        const users = activeTab === 'followers' ? followers : following;
        const filteredUsers = users.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`搜索${activeTab === 'followers' ? '关注者' : '关注中'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? '没有找到匹配的用户' : 
                   activeTab === 'followers' ? '还没有关注者' : '还没有关注任何人'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </div>
        );

      case 'achievements':
        if (achievements.length === 0) {
          return (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">还没有获得任何成就</p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        );

      case 'notifications':
        if (notifications.length === 0) {
          return (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">没有新通知</p>
            </div>
          );
        }
        
        return (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'like' ? 'bg-red-100 text-red-600' :
                    notification.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'follow' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {notification.type === 'like' && <Heart className="w-4 h-4" />}
                    {notification.type === 'comment' && <MessageCircle className="w-4 h-4" />}
                    {notification.type === 'follow' && <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">内容加载中...</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {renderContent()}
    </div>
  );
};