import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '../components/Layout'
import HomePage from '../pages/HomePage'
import HotPage from '../pages/HotPage'
import ProfilePage from '../pages/ProfilePage'
import AboutPage from '../pages/AboutPage'
import PostDetailPage from '../pages/PostDetailPage'
import NotFoundPage from '../pages/NotFoundPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import EmailVerificationPage from '../pages/EmailVerificationPage'
import SecurityLogsPage from '../pages/SecurityLogsPage'
import ActivityPage from '../pages/ActivityPage'
import ActivityDetailPage from '../pages/ActivityDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'hot',
        element: <HotPage />
      },
      {
        path: 'activities',
        element: <ActivityPage />
      },
      {
        path: 'activities/:id',
        element: <ActivityDetailPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'profile/:userId',
        element: <ProfilePage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'post/:id',
        element: <PostDetailPage />
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />
      },
      {
        path: 'verify-email',
        element: <EmailVerificationPage />
      },
      {
        path: 'security-logs',
        element: <SecurityLogsPage />
      }
    ]
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}

export { router }