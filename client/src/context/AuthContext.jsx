import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.log(e);
    } finally {
      setUser(null);
      
    }
  };

  const loginSuccess = (userData) => {
    setUser(userData);
  };

  const isAdmin = user?.role === 'admin';
  const isBanned = user?.isBanned;

  return (
    <AuthContext.Provider value={{ user, setUser, loginSuccess, logout, loading, isAdmin, isBanned }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);