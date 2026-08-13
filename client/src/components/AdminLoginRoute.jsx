import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminLoginRoute() {
  const { user, isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized)
    return (
      <main className="grid min-h-screen place-items-center bg-background text-zinc-400">
        Loading Rigora…
      </main>
    );
  return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Outlet />;
}
