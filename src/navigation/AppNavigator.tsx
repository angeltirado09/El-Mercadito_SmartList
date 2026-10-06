import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ThemeToggleButton from '../components/ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AddProductScreen from '../screens/AddProductScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

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
 * Incluye el botón de cambio de tema (Sol / Luna) en la cabecera superior derecha.
 */
export default function AppNavigator() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.headerText,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <ThemeToggleButton />,
        }}
      >
        {user == null ? (
          // Sin sesión activa: mostrar Login y Register
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'El Mercadito' }}
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
              options={{ title: 'El Mercadito', headerBackVisible: false }}
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
