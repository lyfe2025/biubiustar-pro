import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft, HelpCircle, Mail } from 'lucide-react'

export default function NotFoundPage() {
  const { t } = useTranslation()
  
  useEffect(() => {
    document.title = 'Biubiustar - 页面未找到'
  }, [])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-purple-600 mb-4">404</div>
          <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
        </div>
        
        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('notFound.title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('notFound.description')}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            {t('notFound.backHome')}
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.goBack')}
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            {t('notFound.needHelp')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a 
              href="mailto:support@biubiustar.com" 
              className="text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Mail className="w-4 h-4 inline mr-1" />
              {t('notFound.contactUs')}
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a 
              href="/help" 
              className="text-purple-600 hover:text-purple-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4 inline mr-1" />
              {t('notFound.helpCenter')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}