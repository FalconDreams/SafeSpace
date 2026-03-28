import { useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface ProtectedActionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedAction({ children, fallback }: ProtectedActionProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (user) return <>{children}</>;

  return (
    <>
      <div onClick={() => setShowAuth(true)} className="cursor-pointer">
        {fallback || (
          <div className="rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-6 text-center">
            <p className="font-medium text-teal-800">Sign in to continue</p>
            <p className="mt-1 text-sm text-teal-600">Create a free account to report issues and leave comments</p>
          </div>
        )}
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
