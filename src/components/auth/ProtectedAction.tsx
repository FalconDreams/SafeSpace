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
          <div className="rounded-md border-2 border-dashed border-sage-200 bg-sage-50/50 p-6 text-center">
            <p className="font-medium text-sage-800">Sign in to continue</p>
            <p className="mt-1 text-sm text-sage-600">Create a free account to report issues and leave comments</p>
          </div>
        )}
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
