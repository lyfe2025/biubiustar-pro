/**
 * 格式化日期显示
 * @param dateString - ISO日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * 验证文件类型是否为图片
 * @param file - 文件对象
 * @returns 是否为图片文件
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

/**
 * 验证文件大小是否在限制范围内
 * @param file - 文件对象
 * @param maxSizeMB - 最大文件大小（MB）
 * @returns 是否在大小限制内
 */
export const isFileSizeValid = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024
}

/**
 * 生成文件名
 * @param userId - 用户ID
 * @param originalFileName - 原始文件名
 * @returns 新的文件名
 */
export const generateFileName = (userId: string, originalFileName: string): string => {
  const fileExt = originalFileName.split('.').pop()
  return `${userId}-${Date.now()}.${fileExt}`
}

/**
 * 格式化数字显示（如关注者数量）
 * @param num - 数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 过滤搜索结果
 * @param items - 要过滤的数组
 * @param searchQuery - 搜索关键词
 * @param searchFields - 要搜索的字段
 * @returns 过滤后的结果
 */
export const filterBySearch = <T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchQuery.trim()) return items
  
  const query = searchQuery.toLowerCase()
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      return value && value.toString().toLowerCase().includes(query)
    })
  )
}

/**
 * 生成默认头像URL
 * @param username - 用户名
 * @returns 头像URL
 */
export const getDefaultAvatarUrl = (username: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
}