import React, { useState, useEffect } from 'react'
import { X, Mail, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error(t('auth.emailRequired'))
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setEmailSent(true)
        setCountdown(60)
        toast.success(t('auth.resetEmailSent'))
      }
    } catch (error) {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setCountdown(60)
        toast.success(t('auth.resetEmailSent'))
      }
    } catch (error) {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setEmailSent(false)
    setCountdown(0)
    onClose()
  }

  const handleBackToLogin = () => {
    setEmail('')
    setEmailSent(false)
    setCountdown(0)
    onBackToLogin()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('auth.forgotPasswordTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!emailSent ? (
          /* 发送重置邮件表单 */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('common.loading') : t('auth.sendResetEmail')}
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToLogin')}
            </button>
          </form>
        ) : (
          /* 邮件发送成功页面 */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {t('auth.checkYourEmail')}
            </h3>
            
            <p className="text-gray-600 text-sm">
              {t('auth.resetEmailSentDesc')}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              {email}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {t('auth.didNotReceiveEmail')}
              </p>
              
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 
                  ? t('auth.resendIn', { seconds: countdown })
                  : t('auth.resend')
                }
              </button>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-2 transition-colors mt-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToLogin')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}