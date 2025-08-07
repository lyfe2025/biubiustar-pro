import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言资源
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import viVN from './locales/vi-VN.json'
import zhTW from './locales/zh-TW.json'

const resources = {
  'zh-CN': {
    translation: zhCN
  },
  'en-US': {
    translation: enUS
  },
  'vi-VN': {
    translation: viVN
  },
  'zh-TW': {
    translation: zhTW
  }
}

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 传递 i18n 实例给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources,
    fallbackLng: 'zh-CN',
    debug: process.env.NODE_ENV === 'development',
    
    // 语言检测选项
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'biubiustar-language'
    },

    interpolation: {
      escapeValue: false // React 已经默认转义了
    },

    // 命名空间
    defaultNS: 'translation',
    ns: ['translation'],

    // 键分隔符
    keySeparator: '.',
    nsSeparator: ':',

    // 返回对象而不是字符串
    returnObjects: false,

    // 当键不存在时的行为
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`)
      }
    }
  })

export default i18n

// 导出类型定义
export type Language = 'zh-CN' | 'en-US' | 'vi-VN' | 'zh-TW'

// 语言选项
export const languageOptions = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'zh-TW', label: '繁體中文', flag: '🇹🇼' }
] as const

// 获取当前语言
export const getCurrentLanguage = (): Language => {
  const currentLang = i18n.language as Language
  const supportedLanguages: Language[] = ['zh-CN', 'en-US', 'vi-VN', 'zh-TW']
  return supportedLanguages.includes(currentLang) ? currentLang : 'zh-CN'
}

// 切换语言
export const changeLanguage = (lng: Language) => {
  return i18n.changeLanguage(lng)
}