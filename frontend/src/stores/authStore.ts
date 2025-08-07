import { create } from 'zustand'
import { supabase, type User } from '../lib/supabase'
import { toast } from 'sonner'

interface LoginAttempt {
  email: string
  attempts: number
  lastAttempt: number
  lockedUntil?: number
}

interface SecurityLog {
  id: string
  userId?: string
  action: string
  details: string
  ipAddress?: string
  userAgent?: string
  timestamp: number
  success: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginAttempts: Map<string, LoginAttempt>
  securityLogs: SecurityLog[]
  signIn: (emailOrUsername: string, password: string) => Promise<boolean>
  signUp: (username: string, email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (updates: { username?: string; bio?: string; avatar_url?: string }) => Promise<boolean>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (newPassword: string) => Promise<void>
  resendEmailVerification: (email?: string) => Promise<void>
  checkAccountLocked: (emailOrUsername: string) => boolean
  recordLoginAttempt: (emailOrUsername: string, success: boolean) => void
  addSecurityLog: (action: string, details: string, success: boolean, userId?: string) => void
  getSecurityLogs: (userId?: string) => SecurityLog[]
  clearLoginAttempts: (emailOrUsername: string) => void
}

// 常量配置
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15分钟
const ATTEMPT_WINDOW = 60 * 60 * 1000 // 1小时内的尝试次数

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loginAttempts: new Map(),
  securityLogs: [],

  signIn: async (emailOrUsername: string, password: string) => {
    try {
      set({ isLoading: true })
      
      // 检查账户是否被锁定
      if (get().checkAccountLocked(emailOrUsername)) {
        const attempt = get().loginAttempts.get(emailOrUsername.toLowerCase())
        const remainingTime = attempt?.lockedUntil ? Math.ceil((attempt.lockedUntil - Date.now()) / 60000) : 0
        toast.error(`账户已被锁定，请 ${remainingTime} 分钟后再试`)
        set({ isLoading: false })
        return false
      }
      
      // 判断输入的是邮箱还是用户名
      const isEmail = emailOrUsername.includes('@')
      let email = emailOrUsername
      
      // 如果是用户名，需要先查询对应的邮箱
      if (!isEmail) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()
        
        if (userError) {
          if (userError.code === 'PGRST116') {
            toast.error('用户名不存在')
          } else {
            toast.error('查询用户信息失败')
          }
          get().recordLoginAttempt(emailOrUsername, false)
          get().addSecurityLog('LOGIN_FAILED', `用户名不存在: ${emailOrUsername}`, false)
          return false
        }
        
        if (!userData) {
          toast.error('用户名不存在')
          get().recordLoginAttempt(emailOrUsername, false)
          get().addSecurityLog('LOGIN_FAILED', `用户名不存在: ${emailOrUsername}`, false)
          return false
        }
        
        email = userData.email
      }
      
      // 使用邮箱登录
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        // 记录登录失败
        get().recordLoginAttempt(emailOrUsername, false)
        
        // 提供更友好的错误信息
        let errorMessage = '登录失败'
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = isEmail ? '邮箱或密码错误' : '用户名或密码错误'
          get().addSecurityLog('LOGIN_FAILED', `邮箱或密码错误: ${emailOrUsername}`, false)
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = '请先验证您的邮箱'
          get().addSecurityLog('LOGIN_FAILED', `邮箱未验证: ${emailOrUsername}`, false)
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = '登录尝试过于频繁，请稍后再试'
          get().addSecurityLog('LOGIN_FAILED', `登录尝试过于频繁: ${emailOrUsername}`, false)
        } else {
          errorMessage = `登录失败：${authError.message}`
          get().addSecurityLog('LOGIN_FAILED', `登录失败: ${authError.message}`, false)
        }
        toast.error(errorMessage)
        return false
      }
      
      if (authData.user) {
        // 登录成功，清除失败记录
        get().recordLoginAttempt(emailOrUsername, true)
        
        // 获取用户详细信息
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        if (profileError) {
          toast.error('获取用户信息失败')
          return false
        }
        
        set({ 
          user: userProfile, 
          isAuthenticated: true, 
          isLoading: false 
        })
        
        // 记录登录成功日志
        get().addSecurityLog('LOGIN_SUCCESS', `用户登录成功: ${emailOrUsername}`, true, authData.user.id)
        
        toast.success('登录成功！')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('登录过程中发生错误')
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true })
      
      // 检查用户名是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()
      
      if (existingUser) {
        toast.error('用户名已存在')
        get().addSecurityLog('SIGNUP_FAILED', `用户名已存在: ${username}`, false)
        return false
      }
      
      // 注册用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (authError) {
        toast.error('注册失败：' + authError.message)
        get().addSecurityLog('SIGNUP_FAILED', `注册失败: ${authError.message}`, false)
        return false
      }
      
      if (authData.user) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username,
            email,
            password_hash: '' // 这里不需要存储密码哈希，Supabase Auth已经处理
          })
        
        if (profileError) {
          toast.error('创建用户资料失败')
          get().addSecurityLog('PROFILE_CREATION_FAILED', `创建用户资料失败: ${profileError.message}`, false, authData.user.id)
          return false
        }
        
        // 获取完整的用户信息
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        if (userProfile) {
          set({ 
            user: userProfile, 
            isAuthenticated: true, 
            isLoading: false 
          })
        }
        
        get().addSecurityLog('SIGNUP_SUCCESS', `用户注册成功: ${email}, 用户名: ${username}`, true, authData.user.id)
        toast.success('注册成功！')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('注册过程中发生错误')
      get().addSecurityLog('SIGNUP_ERROR', `注册过程中发生错误: ${error}`, false)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    try {
      const currentUser = get().user
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('退出登录失败')
        get().addSecurityLog('LOGOUT_FAILED', `退出登录失败: ${error.message}`, false, currentUser?.id)
        throw error
      }
      
      // 记录退出登录日志
      get().addSecurityLog('LOGOUT_SUCCESS', `用户退出登录`, true, currentUser?.id)
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      
      toast.success('已退出登录')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userProfile) {
          set({ 
            user: userProfile, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (error) {
      console.error('Check auth error:', error)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateProfile: async (updates: { username?: string; bio?: string; avatar_url?: string }) => {
    try {
      const { user } = get()
      if (!user) {
        toast.error('用户未登录')
        return false
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        toast.error('更新用户信息失败')
        return false
      }

      // Update local state
      set((state) => ({
        user: {
          ...state.user!,
          ...updates
        }
      }))
      
      toast.success('用户信息更新成功')
      return true
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('更新用户信息时发生错误')
      return false
    }
  },

  // 忘记密码
  forgotPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        toast.error('发送重置邮件失败')
        get().addSecurityLog('PASSWORD_RESET_REQUEST_FAILED', `发送重置邮件失败: ${error.message}`, false)
        throw error
      }
      
      // 记录密码重置请求日志
      get().addSecurityLog('PASSWORD_RESET_REQUEST', `请求密码重置: ${email}`, true)
      
      toast.success('重置邮件已发送，请查收')
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  },

  // 重置密码
  resetPassword: async (newPassword: string) => {
    try {
      const currentUser = get().user
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        toast.error('密码重置失败')
        get().addSecurityLog('PASSWORD_RESET_FAILED', `密码重置失败: ${error.message}`, false, currentUser?.id)
        throw error
      }
      
      // 记录密码重置成功日志
      get().addSecurityLog('PASSWORD_RESET_SUCCESS', `密码重置成功`, true, currentUser?.id)
      
      toast.success('密码重置成功')
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  },

  // 重新发送邮箱验证
  resendEmailVerification: async (email?: string) => {
    try {
      const targetEmail = email || get().user?.email
      if (!targetEmail) {
        toast.error('未找到邮箱地址')
        throw new Error('No email found')
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail
      })
      
      if (error) {
        toast.error('发送验证邮件失败')
        throw error
      }
      
      // 记录安全日志
      get().addSecurityLog('EMAIL_VERIFICATION_RESENT', `重新发送验证邮件到: ${targetEmail}`, true)
    } catch (error) {
      console.error('Resend verification error:', error)
      get().addSecurityLog('EMAIL_VERIFICATION_RESENT', `重新发送验证邮件失败: ${error}`, false)
      throw error
    }
  },

  // 检查账户是否被锁定
  checkAccountLocked: (emailOrUsername: string) => {
    const { loginAttempts } = get()
    const attempt = loginAttempts.get(emailOrUsername.toLowerCase())
    
    if (!attempt) return false
    
    const now = Date.now()
    
    // 检查锁定是否已过期
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      // 锁定已过期，清除记录
      get().clearLoginAttempts(emailOrUsername)
      return false
    }
    
    // 检查是否在锁定期内
    return attempt.lockedUntil ? now < attempt.lockedUntil : false
  },

  // 记录登录尝试
  recordLoginAttempt: (emailOrUsername: string, success: boolean) => {
    const { loginAttempts } = get()
    const key = emailOrUsername.toLowerCase()
    const now = Date.now()
    
    if (success) {
      // 登录成功，清除尝试记录
      get().clearLoginAttempts(emailOrUsername)
      return
    }
    
    const existing = loginAttempts.get(key)
    
    if (!existing) {
      // 首次失败尝试
      const newAttempt: LoginAttempt = {
        email: key,
        attempts: 1,
        lastAttempt: now
      }
      
      set(state => ({
        loginAttempts: new Map(state.loginAttempts.set(key, newAttempt))
      }))
    } else {
      // 检查是否在时间窗口内
      if (now - existing.lastAttempt > ATTEMPT_WINDOW) {
        // 超出时间窗口，重置计数
        const resetAttempt: LoginAttempt = {
          email: key,
          attempts: 1,
          lastAttempt: now
        }
        
        set(state => ({
          loginAttempts: new Map(state.loginAttempts.set(key, resetAttempt))
        }))
      } else {
        // 在时间窗口内，增加计数
        const updatedAttempt: LoginAttempt = {
          ...existing,
          attempts: existing.attempts + 1,
          lastAttempt: now
        }
        
        // 检查是否需要锁定账户
        if (updatedAttempt.attempts >= MAX_LOGIN_ATTEMPTS) {
          updatedAttempt.lockedUntil = now + LOCKOUT_DURATION
          toast.error(`账户已被锁定 ${LOCKOUT_DURATION / 60000} 分钟，请稍后再试`)
        }
        
        set(state => ({
          loginAttempts: new Map(state.loginAttempts.set(key, updatedAttempt))
        }))
      }
    }
  },

  // 添加安全日志
  addSecurityLog: (action: string, details: string, success: boolean, userId?: string) => {
    const log: SecurityLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || get().user?.id,
      action,
      details,
      ipAddress: 'Unknown', // 在实际应用中可以获取真实IP
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      success
    }
    
    set(state => ({
      securityLogs: [log, ...state.securityLogs].slice(0, 100) // 保留最近100条日志
    }))
  },

  // 获取安全日志
  getSecurityLogs: (userId?: string) => {
    const { securityLogs } = get()
    
    if (userId) {
      return securityLogs.filter(log => log.userId === userId)
    }
    
    return securityLogs
  },

  // 清除登录尝试记录
  clearLoginAttempts: (emailOrUsername: string) => {
    const key = emailOrUsername.toLowerCase()
    
    set(state => {
      const newAttempts = new Map(state.loginAttempts)
      newAttempts.delete(key)
      return { loginAttempts: newAttempts }
    })
  }
}))