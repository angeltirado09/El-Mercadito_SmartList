import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddProductScreen from '../screens/AddProductScreen';

// ============================================================
// Tipos de rutas para TypeScript
// ============================================================
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddProduct: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================================
// Navigator principal con protección de rutas
// ============================================================
/**
 * Muestra las pantallas de autenticación (Login/Register) cuando no hay sesión,
 * y las pantallas de la app (Home/AddProduct) cuando el usuario está logueado.
 */
export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2d6a4f' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user == null ? (
          // Sin sesión activa: mostrar Login y Register
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: '🛒 El Mercadito' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Crear cuenta' }}
            />
          </>
        ) : (
          // Con sesión activa: mostrar Home y AddProduct
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: '🛒 Mi Lista', headerBackVisible: false }}
            />
            <Stack.Screen
              name="AddProduct"
              component={AddProductScreen}
              options={{ title: 'Agregar producto' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
