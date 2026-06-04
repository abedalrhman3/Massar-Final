import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../api/auth';
import { connectSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — check if a valid cookie session already exists
  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.data.user);
        connectSocket(); // user is already logged in — open socket
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await apiLogout();
    disconnectSocket();
    setUser(null);
  };

  // Call this after a successful login/register response
  const loginSuccess = (userData) => {
    setUser(userData);
    connectSocket();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, loginSuccess, logout, loading, isAdmin, isEditor }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);