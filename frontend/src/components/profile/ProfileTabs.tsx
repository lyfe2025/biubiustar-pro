import React from 'react';
import { Grid, List, FileText, Heart, Bookmark, Archive, Clock, Users, UserCheck, Trophy, BarChart3, Bell, Settings } from 'lucide-react';
import { TabType, ViewMode } from '../../types/profile';

interface ProfileTabsProps {
  activeTab: TabType;
  viewMode: ViewMode;
  isOwnProfile: boolean;
  draftsCount: number;
  notificationsCount: number;
  onTabChange: (tab: TabType) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  viewMode,
  isOwnProfile,
  draftsCount,
  notificationsCount,
  onTabChange,
  onViewModeChange
}) => {
  const tabs = [
    {
      id: 'posts' as TabType,
      label: '帖子',
      icon: FileText,
      visible: true
    },
    {
      id: 'likes' as TabType,
      label: '点赞',
      icon: Heart,
      visible: true
    },
    {
      id: 'bookmarks' as TabType,
      label: '收藏',
      icon: Bookmark,
      visible: true
    },
    {
      id: 'drafts' as TabType,
      label: '草稿箱',
      icon: Archive,
      visible: isOwnProfile,
      count: draftsCount
    },
    {
      id: 'history' as TabType,
      label: '发布历史',
      icon: Clock,
      visible: isOwnProfile
    },
    {
      id: 'followers' as TabType,
      label: '关注者',
      icon: Users,
      visible: true
    },
    {
      id: 'following' as TabType,
      label: '关注中',
      icon: UserCheck,
      visible: true
    },
    {
      id: 'achievements' as TabType,
      label: '成就',
      icon: Trophy,
      visible: true
    },
    {
      id: 'analytics' as TabType,
      label: '数据分析',
      icon: BarChart3,
      visible: isOwnProfile
    },
    {
      id: 'notifications' as TabType,
      label: '消息通知',
      icon: Bell,
      visible: isOwnProfile,
      count: notificationsCount
    },
    {
      id: 'settings' as TabType,
      label: '设置',
      icon: Settings,
      visible: isOwnProfile
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.visible);
  const hasViewModeToggle = ['posts', 'likes', 'bookmarks'].includes(activeTab);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 视图模式切换 */}
      {hasViewModeToggle && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="text-sm text-gray-600">
            {activeTab === 'posts' && '我的帖子'}
            {activeTab === 'likes' && '点赞的帖子'}
            {activeTab === 'bookmarks' && '收藏的帖子'}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="网格视图"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};