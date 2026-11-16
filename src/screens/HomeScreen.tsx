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
import PermissionsModal from '../components/PermissionsModal';
import ProductItem from '../components/ProductItem';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProductStore } from '../store/useProductStore';

// ============================================================
// Types
// ============================================================
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// ============================================================
// Screen
// ============================================================
export default function HomeScreen({ navigation }: Props) {
  const {
    user,
    logout,
    permissions,
    refreshPermissions,
    requestAllPermissions,
    requestPermission,
  } = useAuth();
  const { theme, isDark } = useTheme();

  // Estado Global con Zustand (selectores y acciones del store)
  const products = useProductStore((state) => state.products);
  const loadProducts = useProductStore((state) => state.loadProducts);
  const deleteProductFromStore = useProductStore((state) => state.deleteProduct);
  const updateProductInStore = useProductStore((state) => state.updateProduct);
  const clearProducts = useProductStore((state) => state.clearProducts);

  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);

  useEffect(() => {
    // Actualizar estado de los permisos del dispositivo al montar HomeScreen
    refreshPermissions();
  }, []);

  // Contabilizar permisos denegados y verificar si todos están aprobados
  const permissionList = Object.values(permissions);
  const deniedCount = permissionList.filter((p) => p.status === 'denied').length;
  const allPermissionsGranted =
    permissionList.length > 0 &&
    permissionList.every((p) => p.status === 'granted');

  // useFocusEffect sincroniza los productos del usuario activo desde el store global
  useFocusEffect(
    useCallback(() => {
      loadProducts(user?.username ?? null);
    }, [user?.username, loadProducts])
  );

  /**
   * Elimina un producto por id a través del store global de Zustand.
   */
  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromStore(id, user?.username ?? null);
  };

  /**
   * Alterna el estado de completado de un producto mediante updateProduct del store global.
   */
  const handleToggleProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await updateProductInStore(
      id,
      { completed: !target.completed },
      user?.username ?? null
    );
  };

  const handleLogout = async () => {
    clearProducts();
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
      {/* Cabecera con saludo, botón con ícono de permisos y botón de cierre de sesión */}
      <View style={[styles.headerCard, { backgroundColor: theme.headerCardBackground }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.headerGreetingText }]}>Bienvenido,</Text>
          <Text style={[styles.username, { color: theme.headerText }]}>{user?.username}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            testID="open-permissions-btn"
            accessibilityLabel="Permisos del dispositivo"
            style={[
              styles.permissionsButton,
              {
                backgroundColor: theme.headerButtonBackground,
                borderColor: theme.headerButtonBorder,
              },
            ]}
            onPress={() => {
              refreshPermissions();
              setPermissionsModalVisible(true);
            }}
          >
            <Ionicons
              name={
                allPermissionsGranted
                  ? 'shield-checkmark-outline'
                  : 'alert-outline'
              }
              size={18}
              color={theme.headerButtonText}
            />
          </TouchableOpacity>

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
      </View>

      {/* Aviso claro si algún permiso fue rechazado */}
      {deniedCount > 0 && (
        <TouchableOpacity
          testID="home-denied-permissions-warning"
          style={[
            styles.deniedAlertBanner,
            {
              backgroundColor: theme.dangerContainer,
              borderColor: theme.danger,
            },
          ]}
          onPress={() => setPermissionsModalVisible(true)}
        >
          <Ionicons name="alert-circle-outline" size={18} color={theme.dangerText} />
          <Text style={[styles.deniedAlertText, { color: theme.dangerText }]}>
            Tenés {deniedCount}{' '}
            {deniedCount === 1 ? 'permiso denegado' : 'permisos denegados'}. Tocá
            acá para ver el detalle y habilitarlos.
          </Text>
        </TouchableOpacity>
      )}

      {/* Contador de productos */}
      <View style={[styles.countContainer, { borderBottomColor: theme.borderLight }]}>
        <Text style={[styles.countText, { color: theme.text }]}>
          {products.length === 0
            ? 'No hay productos en tu lista'
            : `${products.length} producto${products.length > 1 ? 's' : ''} en tu lista`}
        </Text>
      </View>

      {/* Lista de productos con FlatList leída desde Zustand */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem
            id={item.id}
            name={item.name}
            completed={item.completed}
            imageUri={item.imageUri}
            location={item.location}
            supplier={item.supplier}
            calendarReminder={item.calendarReminder}
            onDelete={handleDeleteProduct}
            onToggleComplete={handleToggleProduct}
          />
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

      {/* Modal con el estado detallado de cada permiso (Concedido / Denegado / Pendiente) */}
      <PermissionsModal
        visible={permissionsModalVisible}
        permissions={permissions}
        onClose={() => setPermissionsModalVisible(false)}
        onRequestSingle={requestPermission}
        onRequestAll={requestAllPermissions}
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
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
  deniedAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  deniedAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
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
