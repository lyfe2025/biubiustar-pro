import React, { useState } from 'react';
import { Camera, Edit, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { getDefaultAvatarUrl } from '../../utils/profileUtils';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onUploadAvatar: (file: File) => void;
  onSaveProfile: (editForm: { username: string; bio: string; }) => Promise<boolean>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollow,
  onUnfollow,
  onUploadAvatar,
  onSaveProfile
}) => {
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onUploadAvatar(file);
        }
      };
      input.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 背景图片区域 */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
        {isOwnProfile && (
          <button className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        {/* 头像 */}
        <div className="relative -mt-16 sm:-mt-12">
          <div
            className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden ${
              isOwnProfile ? 'cursor-pointer' : ''
            }`}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            onClick={handleAvatarClick}
          >
            <img
              src={profile.avatar_url || getDefaultAvatarUrl(profile.username)}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
            {isOwnProfile && isAvatarHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          {false && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 用户信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {profile.username}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-gray-700 max-w-md">{profile.bio}</p>
              )}


              <p className="mt-1 text-sm text-gray-500">
                加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  编辑资料
                </button>
              ) : (
                <>
                  <button
                    onClick={isFollowing ? onUnfollow : onFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    私信
                  </button>
                </>
              )}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{profile.posts_count}</div>
          <div className="text-sm text-gray-600">帖子</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{profile.followers_count}</div>
          <div className="text-sm text-gray-600">关注者</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{profile.following_count}</div>
          <div className="text-sm text-gray-600">关注中</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-500">获赞</div>
        </div>
      </div>
    </div>
  );
};