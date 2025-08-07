import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { languageOptions, changeLanguage, getCurrentLanguage, type Language } from '../i18n'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const currentLanguage = getCurrentLanguage()

  const handleLanguageChange = async (language: Language) => {
    try {
      await changeLanguage(language)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const currentOption = languageOptions.find(option => option.value === currentLanguage)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={t('language.switch')}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentOption?.flag}</span>
        <span className="hidden md:inline">{currentOption?.label}</span>
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('language.switch')}
              </div>
              
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLanguageChange(option.value)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.flag}</span>
                    <span>{option.label}</span>
                  </div>
                  
                  {currentLanguage === option.value && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}