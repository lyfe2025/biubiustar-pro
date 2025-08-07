import { Outlet } from 'react-router-dom'
import Header from './Header'
import { Toaster } from 'sonner'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}