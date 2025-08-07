import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useTranslation } from "react-i18next"
import { Shield, Clock, CheckCircle, XCircle, Monitor, Smartphone, Globe } from 'lucide-react'

interface SecurityLogDisplay {
  id: string
  action: string
  details: string
  timestamp: number
  success: boolean
  ipAddress?: string
  userAgent?: string
}

const SecurityLogsPage: React.FC = () => {
  const { user, getSecurityLogs } = useAuthStore()
  const { t } = useTranslation()
  const [logs, setLogs] = useState<SecurityLogDisplay[]>([])
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')

  useEffect(() => {
    if (user) {
      const userLogs = getSecurityLogs(user.id)
      setLogs(userLogs)
    }
  }, [user, getSecurityLogs])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILED':
        return <Monitor className="w-4 h-4" />
      case 'LOGOUT_SUCCESS':
      case 'LOGOUT_FAILED':
        return <Shield className="w-4 h-4" />
      case 'PASSWORD_RESET_REQUEST':
      case 'PASSWORD_RESET_SUCCESS':
      case 'PASSWORD_RESET_FAILED':
        return <Shield className="w-4 h-4" />
      case 'EMAIL_VERIFICATION_RESENT':
        return <Globe className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      'LOGIN_SUCCESS': '登录成功',
      'LOGIN_FAILED': '登录失败',
      'LOGOUT_SUCCESS': '退出登录',
      'LOGOUT_FAILED': '退出失败',
      'SIGNUP_SUCCESS': '注册成功',
      'SIGNUP_FAILED': '注册失败',
      'PASSWORD_RESET_REQUEST': '请求密码重置',
      'PASSWORD_RESET_SUCCESS': '密码重置成功',
      'PASSWORD_RESET_FAILED': '密码重置失败',
      'EMAIL_VERIFICATION_RESENT': '重发验证邮件',
      'PROFILE_CREATION_FAILED': '创建资料失败'
    }
    return actionMap[action] || action
  }

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="w-4 h-4" />
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="w-4 h-4" />
    }
    return <Monitor className="w-4 h-4" />
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} 分钟前`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} 小时前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const filteredLogs = logs.filter(log => {
    // 过滤成功/失败状态
    if (filter === 'success' && !log.success) return false
    if (filter === 'failed' && log.success) return false
    
    // 过滤时间范围
    if (timeRange !== 'all') {
      const now = Date.now()
      const timeRangeMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[timeRange]
      
      if (now - log.timestamp > timeRangeMs) return false
    }
    
    return true
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">需要登录</h2>
          <p className="text-gray-600">请先登录以查看安全日志</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">安全日志</h1>
          </div>
          <p className="text-gray-600">查看您账户的安全活动记录</p>
        </div>

        {/* 过滤器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 状态过滤 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态过滤
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部</option>
                <option value="success">成功</option>
                <option value="failed">失败</option>
              </select>
            </div>

            {/* 时间范围过滤 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时间范围
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">最近24小时</option>
                <option value="7d">最近7天</option>
                <option value="30d">最近30天</option>
                <option value="all">全部</option>
              </select>
            </div>
          </div>
        </div>

        {/* 日志列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无日志记录</h3>
              <p className="text-gray-600">在选定的时间范围内没有找到安全活动记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* 状态图标 */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      log.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {log.success ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>

                    {/* 日志内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionIcon(log.action)}
                        <h3 className="text-sm font-medium text-gray-900">
                          {getActionText(log.action)}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? '成功' : '失败'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(log.timestamp)}</span>
                        </div>
                        
                        {log.ipAddress && log.ipAddress !== 'Unknown' && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{log.ipAddress}</span>
                          </div>
                        )}
                        
                        {log.userAgent && (
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(log.userAgent)}
                            <span className="truncate max-w-xs">
                              {log.userAgent.includes('Chrome') ? 'Chrome' :
                               log.userAgent.includes('Firefox') ? 'Firefox' :
                               log.userAgent.includes('Safari') ? 'Safari' :
                               log.userAgent.includes('Edge') ? 'Edge' : '未知浏览器'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 安全提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">安全提示</h4>
              <p className="text-sm text-blue-700">
                如果您发现任何可疑活动，请立即更改密码并联系我们的支持团队。我们建议定期检查您的安全日志以确保账户安全。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityLogsPage