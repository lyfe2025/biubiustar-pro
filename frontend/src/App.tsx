import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './router'
import { useAuthStore } from './stores/authStore'
import './i18n' // 初始化i18n

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 检查用户认证状态
    checkAuth()
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </>
  )
}

export default App
