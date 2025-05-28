import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi, walletApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  name?: string;
  phoneNumber?: string;
  role: 'parent' | 'child';
  balance?: number;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, pin: string) => Promise<void>;
  childLogin: (jarId: string, pin: string) => Promise<void>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
};

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const UserAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!token && !!user
  );
  const { toast } = useToast();

  // Verify token on mount by checking if we can access a protected endpoint
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Try to get wallet balance as a way to verify token
        const balanceData = await walletApi.getBalance();

        // If we get here, token is valid - update user balance
        setUser((prevUser) => {
          if (!prevUser) return null;

          const updatedUser = {
            ...prevUser,
            balance: balanceData.balance,
          };

          // Update stored user data with fresh balance
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const refreshBalance = async () => {
    if (!token || !user) return;

    try {
      console.log(
        'AuthContext: Refreshing balance for user:',
        user.id,
        'role:',
        user.role
      );
      const balanceData = await walletApi.getBalance();
      console.log('AuthContext: Balance refresh response:', balanceData);

      setUser((prevUser) => {
        if (!prevUser) return null;

        const updatedUser = {
          ...prevUser,
          balance: balanceData.balance,
        };

        console.log(
          'AuthContext: Updating user balance from',
          prevUser.balance,
          'to',
          balanceData.balance
        );
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  const login = async (phoneNumber: string, pin: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(phoneNumber, pin);

      setToken(result.token);
      setUser(result.user);
      setIsAuthenticated(true);

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Clear recently active child when parent logs in
      localStorage.removeItem('recentlyActiveChildId');

      toast({
        title: 'Login successful',
        description: `Welcome back${
          result.user.name ? ', ' + result.user.name : ''
        }!`,
      });

      // Refresh balance after login
      await refreshBalance();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description:
          error instanceof Error ? error.message : 'Invalid credentials',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const childLogin = async (jarId: string, pin: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.childLogin(jarId, pin);
      console.log('AuthContext: Child login response:', result);

      setToken(result.token);
      setUser(result.user);
      setIsAuthenticated(true);
      console.log('AuthContext: Set user with balance:', result.user.balance);

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Track this child as recently active for parent dashboard
      if (result.user.id) {
        localStorage.setItem('recentlyActiveChildId', result.user.id);
        localStorage.setItem(
          'recentlyActiveChildTimestamp',
          Date.now().toString()
        );
        console.log(
          'AuthContext: Marked child as recently active:',
          result.user.id
        );
      }

      toast({
        title: 'Login successful',
        description: `Welcome back${
          result.user.name ? ', ' + result.user.name : ''
        }!`,
      });

      // Skip refreshBalance for child login since the login response already includes the correct balance
      // This prevents overriding the balance with a potentially stale value
      console.log(
        'AuthContext: Skipping balance refresh for child login (balance already included in response)'
      );
      // await refreshBalance();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description:
          error instanceof Error ? error.message : 'Invalid credentials',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear recently active child data on logout
    localStorage.removeItem('recentlyActiveChildId');
    localStorage.removeItem('recentlyActiveChildTimestamp');

    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        childLogin,
        logout,
        refreshBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserAuthProvider');
  }
  return context;
};
