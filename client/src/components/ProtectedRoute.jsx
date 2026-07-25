import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  const { user, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!isInitialized)
    return (
      <main className="grid min-h-screen place-items-center bg-[#07090f] text-zinc-400">
        Loading Rigora…
      </main>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
