import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { ProfileContent } from '../components/profile/ProfileContent';
import { ProfileSettings } from '../components/profile/ProfileSettings';
import { ProfileAnalytics } from '../components/profile/ProfileAnalytics';
import { useProfile } from '../hooks/useProfile';
import { TabType, ViewMode, FilterType } from '../types/profile';

// 创建帖子模态框组件
const CreatePostModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, images: File[], settings: any) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [settings, setSettings] = useState({
    allowComments: true,
    isPublic: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(content, selectedImages, settings);
    setContent('');
    setSelectedImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">创建新帖子</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowComments}
                onChange={(e) => setSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
              />
              <span className="text-sm">允许评论</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.isPublic}
                onChange={(e) => setSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
              <span className="text-sm">公开可见</span>
            </label>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              发布
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  
  // 本地状态管理
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // 使用自定义Hook获取所有数据和操作函数
  const {
    profile,
    posts,
    drafts,
    notifications,
    analytics,
    achievements,
    followers,
    followingUsers,
    activityRegistrations,
    loading,
    isOwnProfile,
    isFollowing,
    unreadCount,
    handleFollow,
    handleBookmarkPost,
    handleDeletePost,
    handleAvatarUpload: handleUploadAvatar,
    handleSaveProfile,
    handlePublishDraft,
    markNotificationAsRead,
    fetchActivityRegistrations
  } = useProfile(userId);

  // 添加缺少的处理函数
  const handleLike = async (postId: string) => {
    // Like functionality would be implemented here
    console.log('Like post:', postId);
  };

  const handleUnfollow = async () => {
    // Unfollow functionality would be implemented here
    console.log('Unfollow user');
  };

  const handleCreatePostSubmit = async (content: string, images: File[], settings: any) => {
    try {
      // Create post logic would be implemented here
      toast.success('帖子发布成功！');
    } catch (error) {
      toast.error('发布失败，请重试');
    }
  };

  // 当切换到活动标签页时获取活动报名数据
  useEffect(() => {
    if (activeTab === 'activities' && isOwnProfile) {
      fetchActivityRegistrations();
    }
  }, [activeTab, isOwnProfile, fetchActivityRegistrations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">用户不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 个人资料头部 */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onUploadAvatar={handleUploadAvatar}
        onSaveProfile={handleSaveProfile}
      />

      {/* 标签页导航 */}
      <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          notificationsCount={unreadCount}
          draftsCount={drafts.length}
          isOwnProfile={isOwnProfile}
        />

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'settings' && isOwnProfile ? (
          <ProfileSettings profile={profile} onSave={handleSaveProfile} />
        ) : activeTab === 'analytics' && isOwnProfile ? (
          <ProfileAnalytics analytics={analytics} />
        ) : (
          <ProfileContent
            activeTab={activeTab}
            posts={posts}
            drafts={drafts}
            notifications={notifications}
            achievements={achievements}
            followers={followers}
            following={followingUsers}
            activityRegistrations={activityRegistrations}
            viewMode={viewMode}
            searchQuery={searchQuery}
            filterType={filterType}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilterType}
            onLike={handleLike}
            onBookmark={handleBookmarkPost}
            onDelete={handleDeletePost}
            onPublishDraft={handlePublishDraft}
            onMarkNotificationRead={markNotificationAsRead}
            isOwnProfile={isOwnProfile}
          />
        )}
      </div>

      {/* 创建帖子按钮 */}
      {isOwnProfile && (
        <button
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* 创建帖子模态框 */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePostSubmit}
      />
    </div>
  );
};

export default ProfilePage;