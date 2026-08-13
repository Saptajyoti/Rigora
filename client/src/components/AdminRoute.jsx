import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const { user, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized)
    return (
      <main className="grid min-h-screen place-items-center bg-background text-zinc-400">
        Loading Rigora…
      </main>
    );
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}
