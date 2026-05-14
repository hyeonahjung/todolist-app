import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { TodoListPage } from './pages/TodoListPage';
import { TodoDetailPage } from './pages/TodoDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuthStore } from './stores/useAuthStore';

function AuthGuard() {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) return <Navigate to="/" replace />;
  return <AuthPage />;
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthGuard />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <TodoListPage /> },
          { path: '/todos/:todoId', element: <TodoDetailPage /> },
          { path: '/categories', element: <CategoryPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
