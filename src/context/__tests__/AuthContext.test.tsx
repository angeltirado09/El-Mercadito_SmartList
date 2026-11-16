import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import { AuthProvider, useAuth } from '../AuthContext';

describe('Aislamiento de carritos y solicitud de permisos en AuthContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('al registrar un usuario nuevo se inicializa su lista vacía sin heredar la de otros', async () => {
    // Supongamos que un usuario previo tenía productos
    await AsyncStorage.setItem(
      '@shopping_list_usuario1',
      JSON.stringify([{ id: '1', name: 'Manzanas' }])
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = await renderHook(() => useAuth(), { wrapper });

    let registered = false;
    await act(async () => {
      registered = await result.current.register('usuario2', 'password123');
    });

    expect(registered).toBe(true);
    expect(result.current.user?.username).toBe('usuario2');

    // Verificar que el carrito del usuario nuevo está vacío
    const user2Cart = await AsyncStorage.getItem('@shopping_list_usuario2');
    expect(JSON.parse(user2Cart!)).toEqual([]);

    // Verificar que el carrito del usuario previo no se alteró
    const user1Cart = await AsyncStorage.getItem('@shopping_list_usuario1');
    expect(JSON.parse(user1Cart!)).toEqual([{ id: '1', name: 'Manzanas' }]);
  });

  it('solicita los permisos del dispositivo al registrarse e iniciar sesión', async () => {
    // Simulamos que los permisos están pendientes (undetermined) antes de registrarse
    (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });
    (Contacts.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });
    (Calendar.getCalendarPermissions as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('nuevoUsuario', 'clave1234');
    });

    expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Contacts.requestPermissionsAsync).toHaveBeenCalled();
    expect(Calendar.requestCalendarPermissions).toHaveBeenCalled();
    expect(result.current.permissions.camera.status).toBe('granted');
    expect(result.current.permissions.location.status).toBe('granted');
    expect(result.current.permissions.contacts.status).toBe('granted');
    expect(result.current.permissions.calendar.status).toBe('granted');

    // Cerramos sesión y volvemos a iniciar sesión
    await act(async () => {
      await result.current.logout();
    });

    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });

    await act(async () => {
      const loggedIn = await result.current.login('nuevoUsuario', 'clave1234');
      expect(loggedIn).toBe(true);
    });

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(2);
  });
});
