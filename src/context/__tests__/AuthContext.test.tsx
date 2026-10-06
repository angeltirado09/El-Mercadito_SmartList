import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../AuthContext';

describe('Aislamiento de carritos por usuario en AuthContext', () => {
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
});
