import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../context/AuthContext';
import ProductItem from '../components/ProductItem';
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
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Solicitar permisos de notificación al montar el componente
    requestNotificationPermissions();
  }, []);

  // useFocusEffect se ejecuta cada vez que HomeScreen gana foco (al inicio y al volver de AddProductScreen)
  useFocusEffect(
    useCallback(() => {
      const loadProducts = async () => {
        const raw = await AsyncStorage.getItem('@shopping_list');
        if (raw) {
          setProducts(JSON.parse(raw));
        } else {
          setProducts([]);
        }
      };

      loadProducts();
    }, [])
  );

  /**
   * Elimina un producto por id del estado local y de AsyncStorage.
   */
  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    await AsyncStorage.setItem('@shopping_list', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    await logout();
    // AppNavigator redirige automáticamente a Login cuando user === null
  };

  // Componente para lista vacía
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🧺</Text>
      <Text style={styles.emptyTitle}>Tu lista está vacía</Text>
      <Text style={styles.emptySubtitle}>
        Agregá productos para empezar a organizar tus compras
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {/* Cabecera con saludo y botón de cierre de sesión */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.greeting}>Bienvenido,</Text>
          <Text style={styles.username}>{user?.username} 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Contador de productos */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
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
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addButtonText}>+ Agregar producto</Text>
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
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    backgroundColor: '#2d6a4f',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#b7e4c7',
    fontWeight: '500',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  countText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d6a4f',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#2d6a4f',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#2d6a4f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
