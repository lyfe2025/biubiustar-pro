import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AuthModal from './AuthModal'
import { LanguageSwitcher } from './LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/hot', label: t('nav.hot') },
    { path: '/about', label: t('nav.about') }
  ]

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Biubiustar</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 语言切换器 */}
              <LanguageSwitcher />
              {isAuthenticated && user ? (
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                >
                  <span>{user.username}</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <span>{t('auth.login')}</span>
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    <span>{t('auth.register')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mobile-menu-container">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                {/* Navigation Links */}
                {navItems.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      location.pathname === path
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{label}</span>
                  </Link>
                ))}
                
                {/* Mobile User Actions */}
                <div className="pt-4 border-t border-gray-200">
                  {/* Language Switcher */}
                  <div className="px-3 py-2">
                    <LanguageSwitcher />
                  </div>
                  
                  {isAuthenticated && user ? (
                    <Link
                      to="/profile"
                      className="px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors block"
                    >
                      <span>{user.username}</span>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAuthClick('login')}
                        className="w-full px-3 py-3 text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors rounded-md text-left"
                      >
                        <span>{t('auth.login')}</span>
                      </button>
                      <button
                        onClick={() => handleAuthClick('register')}
                        className="w-full px-3 py-3 bg-purple-600 text-white rounded-md text-base font-medium hover:bg-purple-700 transition-colors text-left"
                      >
                        <span>{t('auth.register')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}