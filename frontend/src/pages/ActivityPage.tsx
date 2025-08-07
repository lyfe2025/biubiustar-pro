import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, Clock, Search, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from "../stores/authStore";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  location?: string;
  max_participants?: number;
  current_participants: number;
  price: number;
  status: 'draft' | 'active' | 'cancelled' | 'completed' | 'preparing' | 'ongoing';
  category?: string;
  tags?: string[];
  organizer_id: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const ActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price'>('date');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'tech', label: '科技' },
    { value: 'sports', label: '运动' },
    { value: 'culture', label: '文化' },
    { value: 'education', label: '教育' },
    { value: 'entertainment', label: '娱乐' },
    { value: 'business', label: '商务' },
    { value: 'social', label: '社交' },
    { value: 'health', label: '健康' },
    { value: 'travel', label: '旅行' },
    { value: 'food', label: '美食' },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'preparing', label: '筹备中' },
    { value: 'ongoing', label: '进行中' },
    { value: 'completed', label: '已结束' },
    { value: 'active', label: '报名中' },
    { value: 'cancelled', label: '已取消' },
  ];

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, selectedStatus, sortBy]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activities')
        .select('*');

      // 添加状态筛选
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      } else {
        // 默认显示除了draft状态外的所有活动
        query = query.neq('status', 'draft');
      }

      // 添加分类筛选
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // 添加搜索
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      // 添加排序
      switch (sortBy) {
        case 'date':
          query = query.order('start_date', { ascending: true });
          break;
        case 'popularity':
          query = query.order('current_participants', { ascending: false });
          break;
        case 'price':
          query = query.order('price', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        toast.error('获取活动列表失败');
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = (activity: Activity) => {
    const now = new Date();
    const regStart = activity.registration_start ? new Date(activity.registration_start) : null;
    const regEnd = activity.registration_end ? new Date(activity.registration_end) : new Date(activity.start_date);
    
    if (regStart && now < regStart) return false;
    if (now > regEnd) return false;
    if (activity.max_participants && activity.current_participants >= activity.max_participants) return false;
    
    return true;
  };

  const getRegistrationStatus = (activity: Activity) => {
    const now = new Date();
    const regStart = activity.registration_start ? new Date(activity.registration_start) : null;
    const regEnd = activity.registration_end ? new Date(activity.registration_end) : new Date(activity.start_date);
    
    if (regStart && now < regStart) return '报名未开始';
    if (now > regEnd) return '报名已结束';
    if (activity.max_participants && activity.current_participants >= activity.max_participants) return '名额已满';
    
    return '可以报名';
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'preparing': { label: '筹备中', color: 'bg-blue-500' },
      'ongoing': { label: '进行中', color: 'bg-green-500' },
      'completed': { label: '已结束', color: 'bg-gray-500' },
      'active': { label: '报名中', color: 'bg-purple-500' },
      'cancelled': { label: '已取消', color: 'bg-red-500' },
      'draft': { label: '草稿', color: 'bg-yellow-500' },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-purple-600 font-medium">加载精彩活动中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 mb-8 border border-purple-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            精彩活动
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            发现有趣的活动，结识志同道合的朋友
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">{activities.length}</div>
              <div className="text-gray-500 text-sm">活动总数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {activities.reduce((sum, activity) => sum + activity.current_participants, 0)}
              </div>
              <div className="text-gray-500 text-sm">参与人数</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索活动..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* 分类筛选 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">所有分类</option>
              <option value="技术">技术</option>
              <option value="艺术">艺术</option>
              <option value="运动">运动</option>
              <option value="学习">学习</option>
              <option value="社交">社交</option>
              <option value="娱乐">娱乐</option>
            </select>

            {/* 状态筛选 */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">所有状态</option>
              <option value="preparing">筹备中</option>
              <option value="ongoing">进行中</option>
              <option value="completed">已结束</option>
              <option value="cancelled">已取消</option>
            </select>

            {/* 排序 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity' | 'price')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="start_date">按开始时间</option>
              <option value="created_at">按创建时间</option>
              <option value="current_participants">按参与人数</option>
              <option value="price">按价格</option>
            </select>
          </div>
        </div>

        {/* 活动列表 */}
        {activities.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg border border-gray-200 p-12 max-w-md mx-auto">
              <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">暂无活动</h3>
              <p className="text-gray-600">当前没有符合条件的活动，请稍后再来看看</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <div key={activity.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1">
                {/* 活动图片 */}
                {activity.image_url && (
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}

                <div className="p-6">
                  {/* 活动标题和描述 */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-2">
                        {/* 活动状态标签 */}
                        <span className={`px-2 py-1 ${getStatusLabel(activity.status).color} text-white text-xs font-medium rounded-full`}>
                          {getStatusLabel(activity.status).label}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>

                  {/* 活动信息 */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="font-medium">{formatDate(activity.start_date)}</span>
                    </div>
                    {activity.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-gray-400" />
                      <span>
                        {activity.current_participants}
                        {activity.max_participants && `/${activity.max_participants}`} 人参与
                      </span>
                    </div>
                  </div>

                  {/* 价格和报名状态 */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-xl font-bold text-purple-600">
                      {activity.price === 0 ? '免费' : `¥${activity.price}`}
                    </div>
                    <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      isRegistrationOpen(activity)
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {getRegistrationStatus(activity)}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <Link
                    to={`/activities/${activity.id}`}
                    className="block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;