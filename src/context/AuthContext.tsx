import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import {
  createInitialPermissionsMap,
  DevicePermissionsMap,
  DeviceResource,
  getAllDevicePermissions,
  PermissionDetail,
  requestAllDevicePermissions,
  requestResourcePermission,
} from '../utils/permissions';

// ============================================================
// Types
// ============================================================
interface User {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  permissions: DevicePermissionsMap;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<DevicePermissionsMap>;
  requestAllPermissions: () => Promise<DevicePermissionsMap>;
  requestPermission: (resource: DeviceResource) => Promise<PermissionDetail>;
}

// ============================================================
// Context
// ============================================================
export const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: createInitialPermissionsMap(),
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshPermissions: async () => createInitialPermissionsMap(),
  requestAllPermissions: async () => createInitialPermissionsMap(),
  requestPermission: async (resource: DeviceResource) =>
    createInitialPermissionsMap()[resource],
});

// ============================================================
// Provider
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<DevicePermissionsMap>(
    createInitialPermissionsMap
  );

  // Verificar sesión activa al montar la app y al volver de Configuración (AppState active)
  useEffect(() => {
    AsyncStorage.getItem('@active_session')
      .then(async (data) => {
        if (data) {
          setUser(JSON.parse(data));
          const currentPerms = await getAllDevicePermissions();
          setPermissions(currentPerms);
        }
      })
      .finally(() => setLoading(false));

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        getAllDevicePermissions()
          .then((updated) => setPermissions(updated))
          .catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Actualiza el mapa de estados de permisos consultando al sistema operativo.
   */
  const refreshPermissions = async (): Promise<DevicePermissionsMap> => {
    const updated = await getAllDevicePermissions();
    setPermissions(updated);
    return updated;
  };

  /**
   * Solicita todos los permisos del dispositivo y actualiza el estado global.
   */
  const requestAllPermissions = async (): Promise<DevicePermissionsMap> => {
    const updated = await requestAllDevicePermissions({ showSummaryAlert: true });
    setPermissions(updated);
    return updated;
  };

  /**
   * Solicita el permiso de un único recurso antes de utilizarlo y actualiza el estado.
   */
  const requestPermission = async (
    resource: DeviceResource
  ): Promise<PermissionDetail> => {
    const detail = await requestResourcePermission(resource, {
      showDeniedAlert: true,
    });
    setPermissions((prev) => ({
      ...prev,
      [resource]: detail,
    }));
    return detail;
  };

  /**
   * Busca el usuario en @users, guarda la sesión activa en @active_session
   * y solicita los permisos de acceso a recursos del dispositivo al iniciar sesión.
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    const raw = await AsyncStorage.getItem('@users');
    const users: User[] = raw ? JSON.parse(raw) : [];
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return false;
    await AsyncStorage.setItem('@active_session', JSON.stringify(found));
    setUser(found);

    // Solicitar permisos del dispositivo al iniciar sesión
    const perms = await requestAllDevicePermissions({ showSummaryAlert: true });
    setPermissions(perms);

    return true;
  };

  /**
   * Registra un nuevo usuario en @users, inicia sesión automáticamente
   * y solicita los permisos de acceso a recursos del dispositivo al registrarse.
   */
  const register = async (username: string, password: string): Promise<boolean> => {
    const raw = await AsyncStorage.getItem('@users');
    const users: User[] = raw ? JSON.parse(raw) : [];
    const exists = users.some((u) => u.username === username);
    if (exists) return false;
    const newUser: User = { username, password };
    users.push(newUser);
    await AsyncStorage.setItem('@users', JSON.stringify(users));
    await AsyncStorage.setItem(`@shopping_list_${username}`, JSON.stringify([]));
    await AsyncStorage.setItem('@active_session', JSON.stringify(newUser));
    setUser(newUser);

    // Solicitar permisos del dispositivo al registrarse
    const perms = await requestAllDevicePermissions({ showSummaryAlert: true });
    setPermissions(perms);

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
        <ActivityIndicator size="large" color="#6d0d18" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        login,
        register,
        logout,
        refreshPermissions,
        requestAllPermissions,
        requestPermission,
      }}
    >
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
    backgroundColor: '#fcf1d5',
  },
});
