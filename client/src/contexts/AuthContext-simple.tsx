import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  displayName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User>({
    username: 'admin',
    displayName: '管理员',
    role: 'admin'
  });
  const [loading] = useState(false);

  const login = async () => {
    // 简化版：直接登录成功
    console.log('登录成功');
  };

  const logout = async () => {
    console.log('退出登录');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: true, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};