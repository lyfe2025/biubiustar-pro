import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Share2, Heart, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from "../stores/authStore";
import { toast } from 'sonner';

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
  status: 'draft' | 'active' | 'cancelled' | 'completed';
  category?: string;
  tags?: string[];
  organizer_id: string;
  is_featured: boolean;
  created_at: string;
}

interface Registration {
  id: string;
  status: 'registered' | 'cancelled' | 'attended' | 'no_show';
  registration_date: string;
}

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchActivity();
      if (user) {
        checkRegistration();
      }
    }
  }, [id, user]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching activity:', error);
        toast.error('获取活动详情失败');
        navigate('/activities');
        return;
      }

      setActivity(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('获取活动详情失败');
      navigate('/activities');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('activity_id', id)
        .eq('user_id', user.id)
        .eq('status', 'registered')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking registration:', error);
        return;
      }

      setRegistration(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!activity) return;

    try {
      setRegistering(true);

      // 检查是否已报名
      if (registration) {
        toast.error('您已经报名了这个活动');
        return;
      }

      // 检查报名条件
      if (!isRegistrationOpen()) {
        toast.error('当前无法报名此活动');
        return;
      }

      const { error } = await supabase
        .from('activity_registrations')
        .insert({
          activity_id: activity.id,
          user_id: user.id,
          status: 'registered'
        });

      if (error) {
        console.error('Error registering:', error);
        if (error.code === '23505') {
          toast.error('您已经报名了这个活动');
        } else {
          toast.error('报名失败，请稍后重试');
        }
        return;
      }

      toast.success('报名成功！');
      await fetchActivity(); // 刷新活动信息
      await checkRegistration(); // 刷新报名状态
    } catch (error) {
      console.error('Error:', error);
      toast.error('报名失败，请稍后重试');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user || !registration) return;

    try {
      setRegistering(true);

      const { error } = await supabase
        .from('activity_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registration.id);

      if (error) {
        console.error('Error cancelling registration:', error);
        toast.error('取消报名失败，请稍后重试');
        return;
      }

      toast.success('已取消报名');
      await fetchActivity(); // 刷新活动信息
      setRegistration(null); // 清除报名状态
    } catch (error) {
      console.error('Error:', error);
      toast.error('取消报名失败，请稍后重试');
    } finally {
      setRegistering(false);
    }
  };

  const isRegistrationOpen = () => {
    if (!activity) return false;
    
    const now = new Date();
    const regStart = activity.registration_start ? new Date(activity.registration_start) : null;
    const regEnd = activity.registration_end ? new Date(activity.registration_end) : new Date(activity.start_date);
    
    if (regStart && now < regStart) return false;
    if (now > regEnd) return false;
    if (activity.max_participants && activity.current_participants >= activity.max_participants) return false;
    
    return true;
  };

  const getRegistrationStatus = () => {
    if (!activity) return '';
    
    const now = new Date();
    const regStart = activity.registration_start ? new Date(activity.registration_start) : null;
    const regEnd = activity.registration_end ? new Date(activity.registration_end) : new Date(activity.start_date);
    
    if (regStart && now < regStart) return '报名未开始';
    if (now > regEnd) return '报名已结束';
    if (activity.max_participants && activity.current_participants >= activity.max_participants) return '名额已满';
    
    return '可以报名';
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity?.title,
          text: activity?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('分享取消');
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    }
  };

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

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">活动不存在</h2>
          <button
            onClick={() => navigate('/activities')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回活动列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/activities')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回活动列表
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 活动图片 */}
          {activity.image_url && (
            <div className="aspect-video bg-gray-200">
              <img
                src={activity.image_url}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* 活动标题和操作 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
                  {activity.is_featured && (
                    <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      推荐活动
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600">{activity.description}</p>
              </div>
              <button
                onClick={handleShare}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* 活动信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">开始时间</p>
                    <p className="font-medium">{formatDate(activity.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">结束时间</p>
                    <p className="font-medium">{formatDate(activity.end_date)}</p>
                  </div>
                </div>
                {activity.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">活动地点</p>
                      <p className="font-medium">{activity.location}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">参与人数</p>
                    <p className="font-medium">
                      {activity.current_participants}
                      {activity.max_participants && `/${activity.max_participants}`} 人
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">活动费用</p>
                    <p className="font-medium text-blue-600">
                      {activity.price === 0 ? '免费' : `¥${activity.price}`}
                    </p>
                  </div>
                </div>
                {activity.category && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">活动分类</p>
                      <p className="font-medium">{activity.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 活动详情内容 */}
            {activity.content && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">活动详情</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {activity.content}
                </div>
              </div>
            )}

            {/* 标签 */}
            {activity.tags && activity.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 报名区域 */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {activity.price === 0 ? '免费活动' : `¥${activity.price}`}
                  </p>
                  <p className={`text-sm ${
                    isRegistrationOpen() ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getRegistrationStatus()}
                  </p>
                </div>
                <div className="flex gap-3">
                  {user ? (
                    registration ? (
                      <button
                        onClick={handleCancelRegistration}
                        disabled={registering}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {registering ? '处理中...' : '取消报名'}
                      </button>
                    ) : (
                      <button
                        onClick={handleRegister}
                        disabled={registering || !isRegistrationOpen()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {registering ? '报名中...' : '立即报名'}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => toast.error('请先登录')}
                      className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    >
                      请先登录
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailPage;