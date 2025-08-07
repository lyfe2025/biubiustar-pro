import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAuthStore()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    const checkResetToken = async () => {
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      
      if (!accessToken || !refreshToken) {
        setIsValidToken(false)
        setIsCheckingToken(false)
        return
      }

      try {
        // 设置会话
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (error) {
          setIsValidToken(false)
        } else {
          setIsValidToken(true)
        }
      } catch (error) {
        console.error('Token validation error:', error)
        setIsValidToken(false)
      } finally {
        setIsCheckingToken(false)
      }
    }

    checkResetToken()
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.password) {
      toast.error(t('auth.passwordRequired'))
      return false
    }
    
    if (formData.password.length < 6) {
      toast.error(t('auth.passwordTooShort'))
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await resetPassword(formData.password)
      setResetSuccess(true)
      toast.success(t('auth.resetPasswordSuccess'))
      
      // 3秒后跳转到首页
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error.message || t('auth.resetPasswordFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t('auth.invalidResetToken')}
          </h1>
          <p className="text-gray-600 mb-6">
            重置链接无效或已过期，请重新申请密码重置。
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t('auth.resetPasswordSuccess')}
          </h1>
          <p className="text-gray-600 mb-6">
            您的密码已成功重置，即将跳转到首页...
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            立即跳转
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.resetPassword')}
          </h1>
          <p className="text-gray-600">
            请输入您的新密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 新密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入新密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmNewPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请再次输入新密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t('common.loading') : t('auth.resetPassword')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage