import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Calendar, TrendingUp, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function AboutPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // 重置表单
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', phone: '', category: '', message: '' })
    }, 3000)
  }

  const milestones = [
    {
      year: '2020',
      title: t('about.timeline.2020.title'),
      description: t('about.timeline.2020.description')
    },
    {
      year: '2021',
      title: t('about.timeline.2021.title'),
      description: t('about.timeline.2021.description')
    },
    {
      year: '2022',
      title: t('about.timeline.2022.title'),
      description: t('about.timeline.2022.description')
    },
    {
      year: '2023',
      title: t('about.timeline.2023.title'),
      description: t('about.timeline.2023.description')
    },
    {
      year: '2024',
      title: t('about.timeline.2024.title'),
      description: t('about.timeline.2024.description')
    }
  ]

  const achievements = [
    {
      quarter: 'Q1 2024',
      metrics: [
        { label: t('about.achievements.users'), value: '500K+' },
        { label: t('about.achievements.posts'), value: '2M+' },
        { label: t('about.achievements.engagement'), value: '85%' }
      ]
    },
    {
      quarter: 'Q2 2024',
      metrics: [
        { label: t('about.achievements.users'), value: '750K+' },
        { label: t('about.achievements.posts'), value: '3.5M+' },
        { label: t('about.achievements.engagement'), value: '88%' }
      ]
    },
    {
      quarter: 'Q3 2024',
      metrics: [
        { label: t('about.achievements.users'), value: '1M+' },
        { label: t('about.achievements.posts'), value: '5M+' },
        { label: t('about.achievements.engagement'), value: '92%' }
      ]
    }
  ]

  const cooperationCategories = [
    { value: 'brand', label: t('about.cooperation.brand') },
    { value: 'content', label: t('about.cooperation.content') },
    { value: 'technology', label: t('about.cooperation.technology') },
    { value: 'investment', label: t('about.cooperation.investment') },
    { value: 'other', label: t('about.cooperation.other') }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.hero.title')}</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              {t('about.intro.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {t('about.intro.description1')}
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {t('about.intro.description2')}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('about.intro.description3')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {t('about.intro.mission.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('about.intro.mission.description')}
                </p>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {t('about.intro.vision.title')}
                </h3>
                <p className="text-gray-600">
                  {t('about.intro.vision.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('about.timeline.title')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-purple-200"></div>
              
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                  }`}>
                    <div className="bg-gray-50 rounded-lg p-6 shadow-md">
                      <div className="flex items-center mb-3">
                        <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-2xl font-bold text-purple-600">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('about.achievements.title')}
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {achievements.map((achievement, index) => (
                <div key={achievement.quarter} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">{achievement.quarter}</h3>
                  </div>
                  <div className="space-y-4">
                    {achievement.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="flex justify-between items-center">
                        <span className="text-gray-600">{metric.label}</span>
                        <span className="text-2xl font-bold text-purple-600">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('about.contact.title')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-900">
                  {t('about.contact.info.title')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-gray-600">contact@biubiustar.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-gray-600">+84 123 456 789</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-gray-600">{t('about.contact.address')}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">
                    {t('about.contact.hours.title')}
                  </h4>
                  <p className="text-gray-600">{t('about.contact.hours.weekdays')}</p>
                  <p className="text-gray-600">{t('about.contact.hours.weekends')}</p>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.form.category')}
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">{t('about.form.selectCategory')}</option>
                      {cooperationCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.form.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-md font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {t('about.form.submitted')}
                      </>
                    ) : isSubmitting ? (
                      t('about.form.submitting')
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {t('about.form.submit')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}