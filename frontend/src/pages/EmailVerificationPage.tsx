import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resendEmailVerification } = useAuthStore()
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [userEmail, setUserEmail] = useState('')

  // 从URL参数获取token和email
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    document.title = `${t('auth.emailVerification')} - Biubiustar`
    
    if (email) {
      setUserEmail(email)
    }
    
    // 如果有token，自动验证
    if (token) {
      verifyEmail(token)
    } else {
      // 没有token，显示错误状态
      setVerificationStatus('error')
    }
  }, [token, email, t])

  // 倒计时效果
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerificationStatus('verifying')
      
      // 调用Supabase验证邮箱API
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: verificationToken,
        type: 'email'
      })

      if (error) {
        console.error('Email verification error:', error)
        setVerificationStatus('error')
        toast.error(t('auth.emailVerificationFailed'))
      } else {
        setVerificationStatus('success')
        toast.success(t('auth.emailVerificationSuccess'))
        
        // 3秒后跳转到首页
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 3000)
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setVerificationStatus('error')
      toast.error(t('auth.emailVerificationFailed'))
    }
  }

  const handleResendVerification = async () => {
    if (!userEmail || isResending || resendCooldown > 0) return

    try {
      setIsResending(true)
      await resendEmailVerification(userEmail)
      toast.success(t('auth.verificationEmailSent'))
      setResendCooldown(60) // 60秒冷却时间
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error(t('auth.resendVerificationFailed'))
    } finally {
      setIsResending(false)
    }
  }

  const renderVerificationContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.verifyingEmail')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('auth.verifyingEmailDescription')}
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.emailVerificationSuccess')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('auth.emailVerificationSuccessDescription')}
            </p>
            <p className="text-sm text-gray-500">
              {t('auth.redirectingToHome')}
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.emailVerificationFailed')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('auth.emailVerificationFailedDescription')}
            </p>
            
            {userEmail && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">{userEmail}</span>
                </div>
                <button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.sending')}
                    </div>
                  ) : resendCooldown > 0 ? (
                    `${t('auth.resendIn')} ${resendCooldown}s`
                  ) : (
                    t('auth.resendVerificationEmail')
                  )}
                </button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToHome')}
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {renderVerificationContent()}
      </div>
    </div>
  )
}

export default EmailVerificationPage