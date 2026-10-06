import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import ProductItem from '../components/ProductItem';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { requestNotificationPermissions } from '../utils/notifications';

// ============================================================
// Types
// ============================================================
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface Product {
  id: string;
  name: string;
}

// ============================================================
// Screen
// ============================================================
export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Solicitar permisos de notificación al montar el componente
    requestNotificationPermissions();
  }, []);

  // useFocusEffect se ejecuta cada vez que HomeScreen gana foco (al inicio y al volver de AddProductScreen)
  useFocusEffect(
    useCallback(() => {
      const loadProducts = async () => {
        if (!user?.username) {
          setProducts([]);
          return;
        }
        const storageKey = `@shopping_list_${user.username}`;
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          setProducts(JSON.parse(raw));
        } else {
          setProducts([]);
        }
      };

      loadProducts();
    }, [user?.username])
  );

  /**
   * Elimina un producto por id del estado local y de AsyncStorage para el usuario activo.
   */
  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    if (user?.username) {
      await AsyncStorage.setItem(
        `@shopping_list_${user.username}`,
        JSON.stringify(updated)
      );
    }
  };

  const handleLogout = async () => {
    setProducts([]);
    await logout();
    // AppNavigator redirige automáticamente a Login cuando user === null
  };

  // Componente para lista vacía con ícono que hace juego con el fondo
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: isDark
              ? 'rgba(252, 241, 213, 0.12)'
              : 'rgba(109, 13, 24, 0.08)',
            borderColor: isDark
              ? 'rgba(252, 241, 213, 0.25)'
              : 'rgba(109, 13, 24, 0.18)',
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <Ionicons
          testID="empty-basket-icon"
          name="basket-outline"
          size={52}
          color={theme.text}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Tu lista está vacía</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Agregá productos para empezar a organizar tus compras
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['bottom', 'left', 'right']}
    >
      {/* Cabecera con saludo y botón de cierre de sesión (se invierte en Modo Oscuro) */}
      <View style={[styles.headerCard, { backgroundColor: theme.headerCardBackground }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.headerGreetingText }]}>Bienvenido,</Text>
          <Text style={[styles.username, { color: theme.headerText }]}>{user?.username}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.headerButtonBackground,
              borderColor: theme.headerButtonBorder,
            },
          ]}
          onPress={handleLogout}
        >
          <Text
            style={[
              styles.logoutButtonText,
              { color: theme.headerButtonText },
            ]}
          >
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contador de productos */}
      <View style={[styles.countContainer, { borderBottomColor: theme.borderLight }]}>
        <Text style={[styles.countText, { color: theme.text }]}>
          {products.length === 0
            ? 'No hay productos en tu lista'
            : `${products.length} producto${products.length > 1 ? 's' : ''} en tu lista`}
        </Text>
      </View>

      {/* Lista de productos con FlatList */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem id={item.id} name={item.name} onDelete={deleteProduct} />
        )}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={
          products.length === 0 ? styles.emptyList : styles.list
        }
      />

      {/* Botón para navegar a AddProductScreen */}
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: theme.buttonPrimary,
            shadowColor: theme.shadowColor,
          },
        ]}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={[styles.addButtonText, { color: theme.buttonPrimaryText }]}>
          + Agregar producto
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ============================================================
// Estilos
// ============================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerCard: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.75,
  },
  addButton: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
