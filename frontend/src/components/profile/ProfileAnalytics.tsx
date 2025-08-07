import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share, Users, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';
import { Analytics, ActivityStats } from '../../types/profile';
import { formatNumber } from '../../utils/profileUtils';

interface ProfileAnalyticsProps {
  analytics: Analytics;
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  analytics
}) => {
  // 创建默认的活动统计数据
  const activityStats: ActivityStats = {
    dailyPosts: 2,
    weeklyEngagement: 85,
    monthlyGrowth: 15,
    totalPosts: 0,
    totalLikes: analytics.totalLikes || 0,
    totalComments: analytics.totalComments || 0,
    totalShares: analytics.totalShares || 0,
    avgEngagement: 0,
    peakHour: 14,
    activeHours: [9, 10, 11, 14, 15, 16, 20, 21],
    weeklyActivity: [65, 78, 82, 75, 88, 45, 52]
  };
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  const timeRangeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '1y', label: '最近1年' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: '折线图', icon: TrendingUp },
    { value: 'bar', label: '柱状图', icon: BarChart3 },
    { value: 'pie', label: '饼图', icon: PieChart }
  ];

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderStatCard = (title: string, value: number, previousValue: number, icon: React.ElementType, color: string) => {
    const Icon = icon;
    const growthRate = getGrowthRate(value, previousValue);
    const isPositive = growthRate >= 0;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(growthRate).toFixed(1)}%
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(value)}
          </h3>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xs text-gray-500 mt-1">
            较上期 {isPositive ? '增长' : '下降'} {Math.abs(growthRate).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    // 模拟图表数据
    const chartData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '浏览量',
          data: [1200, 1900, 3000, 5000, 2000, 3000],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
          label: '点赞数',
          data: [800, 1200, 2000, 3200, 1500, 2100],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        }
      ]
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">数据趋势</h3>
          <div className="flex gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {chartTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setChartType(option.value as any)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  chartType === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* 简化的图表展示 */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">图表数据加载中...</p>
            <p className="text-xs text-gray-400 mt-1">
              当前显示: {chartTypeOptions.find(o => o.value === chartType)?.label} - {timeRangeOptions.find(o => o.value === timeRange)?.label}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTopContent = () => {
    const topPosts = [
      {
        id: '1',
        title: '我的第一篇技术博客',
        views: 15420,
        likes: 892,
        comments: 156,
        shares: 89,
        date: '2024-01-15'
      },
      {
        id: '2',
        title: '前端开发最佳实践分享',
        views: 12350,
        likes: 756,
        comments: 134,
        shares: 67,
        date: '2024-01-10'
      },
      {
        id: '3',
        title: 'React Hooks 深度解析',
        views: 9870,
        likes: 623,
        comments: 98,
        shares: 45,
        date: '2024-01-05'
      }
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">热门内容</h3>
        <div className="space-y-4">
          {topPosts.map((post, index) => (
            <div key={post.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{post.title}</h4>
                <p className="text-xs text-gray-500">{post.date}</p>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(post.views)}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {formatNumber(post.likes)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {formatNumber(post.comments)}
                </div>
                <div className="flex items-center gap-1">
                  <Share className="w-4 h-4" />
                  {formatNumber(post.shares)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActivityHeatmap = () => {
    // 生成活动热力图数据（简化版）
    const generateHeatmapData = () => {
      const data = [];
      const today = new Date();
      for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const activity = Math.floor(Math.random() * 5); // 0-4 活跃度等级
        data.push({
          date: date.toISOString().split('T')[0],
          count: activity
        });
      }
      return data;
    };

    const heatmapData = generateHeatmapData();
    const weeks = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      weeks.push(heatmapData.slice(i, i + 7));
    }

    const getActivityColor = (count: number) => {
      switch (count) {
        case 0: return 'bg-gray-100';
        case 1: return 'bg-green-100';
        case 2: return 'bg-green-200';
        case 3: return 'bg-green-300';
        case 4: return 'bg-green-400';
        default: return 'bg-gray-100';
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">活动热力图</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>少</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`} />
              ))}
            </div>
            <span>多</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-1" style={{ minWidth: '800px' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} hover:ring-2 hover:ring-blue-300 cursor-pointer`}
                    title={`${day.date}: ${day.count} 次活动`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>过去一年共有 {heatmapData.filter(d => d.count > 0).length} 天有活动</p>
        </div>
      </div>
    );
  };

  const renderAudienceInsights = () => {
    const audienceData = {
      demographics: {
        age: [
          { range: '18-24', percentage: 25 },
          { range: '25-34', percentage: 45 },
          { range: '35-44', percentage: 20 },
          { range: '45+', percentage: 10 }
        ],
        gender: [
          { type: '男性', percentage: 60 },
          { type: '女性', percentage: 35 },
          { type: '其他', percentage: 5 }
        ],
        location: [
          { city: '北京', percentage: 30 },
          { city: '上海', percentage: 25 },
          { city: '深圳', percentage: 20 },
          { city: '杭州', percentage: 15 },
          { city: '其他', percentage: 10 }
        ]
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">受众分析</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 年龄分布 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">年龄分布</h4>
            <div className="space-y-2">
              {audienceData.demographics.age.map((item) => (
                <div key={item.range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 性别分布 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">性别分布</h4>
            <div className="space-y-2">
              {audienceData.demographics.gender.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 地域分布 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">地域分布</h4>
            <div className="space-y-2">
              {audienceData.demographics.location.map((item) => (
                <div key={item.city} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.city}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatCard('总浏览量', analytics.totalViews, analytics.totalViews - 1000, Eye, 'bg-blue-500')}
        {renderStatCard('总点赞数', analytics.totalLikes, analytics.totalLikes - 200, Heart, 'bg-red-500')}
        {renderStatCard('总评论数', analytics.totalComments, analytics.totalComments - 50, MessageCircle, 'bg-green-500')}
        {renderStatCard('总关注者', 0, 0, Users, 'bg-purple-500')}
      </div>

      {/* 数据趋势图表 */}
      {renderChart()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 热门内容 */}
        {renderTopContent()}
        
        {/* 受众分析 */}
        {renderAudienceInsights()}
      </div>

      {/* 活动热力图 */}
      {renderActivityHeatmap()}
    </div>
  );
};