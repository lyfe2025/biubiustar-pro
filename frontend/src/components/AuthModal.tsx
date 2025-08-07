import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Eye, EyeOff, Mail, User, Lock, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register' | 'forgot-password'
  onModeChange: (mode: 'login' | 'register' | 'forgot-password') => void
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetEmail: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [realTimeErrors, setRealTimeErrors] = useState<Record<string, string>>({})  
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetCountdown, setResetCountdown] = useState(0)
  
  const { signIn, signUp, isLoading, resendEmailVerification } = useAuthStore()

  // 重置密码倒计时
  useEffect(() => {
    if (resetCountdown > 0) {
      const timer = setTimeout(() => setResetCountdown(resetCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resetCountdown])

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setFormData({
        emailOrUsername: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        resetEmail: ''
      })
      setErrors({})
      setShowPassword(false)
      setShowConfirmPassword(false)
      setResetEmailSent(false)
      setResetCountdown(0)
    }
  }, [isOpen, mode])

  // 实时验证单个字段
  const validateField = (field: string, value: string) => {
    let error = ''
    
    switch (field) {
      case 'username':
        if (!value.trim()) {
          error = t('auth.usernameRequired')
        } else if (value.length < 3) {
          error = t('auth.invalidUsername')
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = t('auth.invalidUsernameFormat')
        }
        break
        
      case 'email':
      case 'resetEmail':
        if (!value.trim()) {
          error = t('auth.emailRequired')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t('auth.invalidEmail')
        }
        break
        
      case 'emailOrUsername':
        if (!value.trim()) {
          error = t('auth.emailOrUsernameRequired')
        }
        break
        
      case 'password':
        if (!value) {
          error = t('auth.passwordRequired')
        } else if (value.length < 6) {
          error = t('auth.invalidPassword')
        } else if (mode === 'register') {
          // 注册时检查密码强度
          const hasLetter = /[a-zA-Z]/.test(value)
          const hasNumber = /\d/.test(value)
          if (!hasLetter || !hasNumber) {
            error = '密码必须包含字母和数字'
          }
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          error = t('auth.passwordRequired')
        } else if (formData.password !== value) {
          error = t('auth.passwordMismatch')
        }
        break
    }
    
    return error
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mode === 'register') {
      newErrors.username = validateField('username', formData.username)
      newErrors.email = validateField('email', formData.email)
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword)
    } else {
      newErrors.emailOrUsername = validateField('emailOrUsername', formData.emailOrUsername)
    }

    newErrors.password = validateField('password', formData.password)

    // 过滤掉空错误
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, error]) => error !== '')
    )

    setErrors(filteredErrors)
    return Object.keys(filteredErrors).length === 0
  }

  // 处理重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateField('resetEmail', formData.resetEmail)
    if (emailError) {
      setErrors({ resetEmail: emailError })
      return
    }
    
    setErrors({})
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setErrors({ general: error.message })
      } else {
        setResetEmailSent(true)
        setResetCountdown(60)
        toast.success(t('auth.resetEmailSent'))
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setErrors({ general: t('auth.unexpectedError') })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 重新发送重置邮件
  const handleResendResetEmail = async () => {
    if (resetCountdown > 0) return
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        toast.error(error.message)
      } else {
        setResetCountdown(60)
        toast.success(t('auth.resetEmailSent'))
      }
    } catch (error) {
      console.error('Resend reset email error:', error)
      toast.error(t('auth.unexpectedError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'forgot-password') {
      return handleResetPassword(e)
    }
    
    // 防止重复提交
    if (isSubmitting || isLoading) return
    
    if (!validateForm()) return

    setIsSubmitting(true)
    let success = false
    
    try {
      if (mode === 'login') {
        success = await signIn(formData.emailOrUsername, formData.password)
        if (success) {
          onClose()
        }
      } else {
        success = await signUp(formData.username, formData.email, formData.password)
        if (success) {
          // 注册成功后显示邮箱验证提示
          setRegisteredEmail(formData.email)
          setShowEmailVerification(true)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // 实时验证（延迟执行以避免过于频繁的验证）
    const timeoutId = setTimeout(() => {
      const error = validateField(field, value)
      setRealTimeErrors(prev => ({
        ...prev,
        [field]: error
      }))
    }, 500)
    
    // 清理之前的定时器
    return () => clearTimeout(timeoutId)
  }

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification(registeredEmail)
      toast.success(t('auth.verificationEmailSent'))
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error(t('auth.resendVerificationFailed'))
    }
  }

  if (!isOpen) return null

  // 显示邮箱验证提示
  if (showEmailVerification) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('auth.registrationSuccess')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('auth.verificationEmailSentTo')}
            </p>
            <p className="text-sm font-medium text-purple-600 mb-6">
              {registeredEmail}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t('auth.checkEmailAndVerify')}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('auth.resendVerificationEmail')}
              </button>
              
              <button
                onClick={() => {
                  setShowEmailVerification(false)
                  onClose()
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {mode === 'forgot-password' && (
              <button
                onClick={() => onModeChange('login')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'login' && t('auth.login')}
              {mode === 'register' && t('auth.register')}
              {mode === 'forgot-password' && t('auth.forgotPassword')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        {mode === 'forgot-password' ? (
          resetEmailSent ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('auth.resetEmailSent')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('auth.resetEmailSentDescription', { email: formData.resetEmail })}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleResendResetEmail}
                  disabled={resetCountdown > 0 || isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('auth.sending')}
                    </div>
                  ) : resetCountdown > 0 ? (
                    `${t('auth.resendIn')} ${resetCountdown}s`
                  ) : (
                    t('auth.resendEmail')
                  )}
                </button>
                <button
                  onClick={() => onModeChange('login')}
                  className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('auth.backToLogin')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.resetEmail}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData(prev => ({ ...prev, resetEmail: value }))
                      if (errors.resetEmail) {
                        const error = validateField('resetEmail', value)
                        setRealTimeErrors(prev => ({ ...prev, resetEmail: error }))
                      }
                    }}
                    onBlur={(e) => {
                      const error = validateField('resetEmail', e.target.value)
                      setRealTimeErrors(prev => ({ ...prev, resetEmail: error }))
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.resetEmail || realTimeErrors.resetEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.enterEmail')}
                  />
                </div>
                {(errors.resetEmail || realTimeErrors.resetEmail) && (
                  <p className="text-red-500 text-sm">{errors.resetEmail || realTimeErrors.resetEmail}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('auth.sending')}
                  </div>
                ) : (
                  t('auth.sendResetEmail')
                )}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.username')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      (errors.username || realTimeErrors.username) ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.username')}
                  />
                </div>
                {(errors.username || realTimeErrors.username) && (
                  <p className="text-red-500 text-xs mt-1">{errors.username || realTimeErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      (errors.email || realTimeErrors.email) ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.email')}
                  />
                </div>
                {(errors.email || realTimeErrors.email) && (
                  <p className="text-red-500 text-xs mt-1">{errors.email || realTimeErrors.email}</p>
                )}
              </div>
            </>
          )}

          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.emailOrUsername')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.emailOrUsername}
                  onChange={(e) => handleInputChange('emailOrUsername', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    (errors.emailOrUsername || realTimeErrors.emailOrUsername) ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.emailOrUsername')}
                />
              </div>
              {(errors.emailOrUsername || realTimeErrors.emailOrUsername) && (
                <p className="text-red-500 text-xs mt-1">{errors.emailOrUsername || realTimeErrors.emailOrUsername}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  (errors.password || realTimeErrors.password) ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('auth.password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'register' && formData.password && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">密码强度：</div>
                <div className="flex space-x-1">
                  <div className={`h-1 flex-1 rounded ${
                    formData.password.length >= 6 ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                  <div className={`h-1 flex-1 rounded ${
                    /[a-zA-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                  <div className={`h-1 flex-1 rounded ${
                    /\d/.test(formData.password) ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  至少6位，包含字母和数字
                </div>
              </div>
            )}
            {(errors.password || realTimeErrors.password) && (
              <p className="text-red-500 text-xs mt-1">{errors.password || realTimeErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    (errors.confirmPassword || realTimeErrors.confirmPassword) ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {(errors.confirmPassword || realTimeErrors.confirmPassword) && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword || realTimeErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isLoading || isSubmitting) ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {mode === 'login' ? t('auth.signingIn') : t('auth.signingUp')}
              </div>
            ) : (
              mode === 'login' ? t('auth.login') : t('auth.register')
            )}
          </button>

          {/* 忘记密码链接 - 仅在登录模式显示 */}
          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => onModeChange('forgot-password')}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                {t('auth.forgotPasswordTitle')}？
              </button>
            </div>
          )}
        </form>
        )}

        {/* Footer */}
        {mode !== 'forgot-password' && (
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}
              <button
                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                className="text-purple-600 hover:text-purple-700 font-medium ml-1"
              >
                {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}