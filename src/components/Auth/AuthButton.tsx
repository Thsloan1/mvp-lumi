import React from 'react';
import { Button } from '../UI/Button';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface AuthButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const { currentUser, isAuthenticated, signout } = useAppContext();

  if (!currentUser && isAuthenticated) {
    return (
      <Button disabled variant={variant} size={size} className={className}>
        Loading...
      </Button>
    );
  }

  if (currentUser) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">
            {currentUser.fullName?.split(' ')[0]}
          </span>
        </div>
        <Button
          onClick={() => signout()}
          variant="ghost"
          size={size}
          icon={LogOut}
          className={className}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => console.log('Social login not implemented in demo')}
      variant={variant}
      size={size}
      icon={LogIn}
      className={className}
    >
      Sign In with Google
    </Button>
  );
};