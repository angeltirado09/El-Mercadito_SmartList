import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// ============================================================
// Types
// ============================================================
interface User {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// ============================================================
// Context
// ============================================================
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

// ============================================================
// Provider
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión activa al montar la app
  useEffect(() => {
    AsyncStorage.getItem('@active_session')
      .then((data) => {
        if (data) setUser(JSON.parse(data));
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Busca el usuario en @users y guarda la sesión activa en @active_session.
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    const raw = await AsyncStorage.getItem('@users');
    const users: User[] = raw ? JSON.parse(raw) : [];
    const found = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!found) return false;
    await AsyncStorage.setItem('@active_session', JSON.stringify(found));
    setUser(found);
    return true;
  };

  /**
   * Registra un nuevo usuario en @users e inicia sesión automáticamente.
   */
  const register = async (username: string, password: string): Promise<boolean> => {
    const raw = await AsyncStorage.getItem('@users');
    const users: User[] = raw ? JSON.parse(raw) : [];
    const exists = users.some((u) => u.username === username);
    if (exists) return false;
    const newUser: User = { username, password };
    users.push(newUser);
    await AsyncStorage.setItem('@users', JSON.stringify(users));
    await AsyncStorage.setItem('@active_session', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  /**
   * Cierra sesión eliminando @active_session de AsyncStorage.
   */
  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('@active_session');
    setUser(null);
  };

  // Indicador de carga mientras se verifica la sesión almacenada
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook consumidor
// ============================================================
export function useAuth() {
  return useContext(AuthContext);
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
