import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getItem('massair_user')
      .then(data => {
        if (data) setUser(JSON.parse(data));
      })
      .catch(err => console.log('Storage loading error:', err))
      .finally(() => setLoading(false));
  }, []);

  const login = async (userData) => {
    await storage.setItem('massair_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await storage.removeItem('massair_user');
    setUser(null);
  };

  const updateUser = async (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    await storage.setItem('massair_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
