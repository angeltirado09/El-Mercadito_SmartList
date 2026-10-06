import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateProductName } from '../utils/validators';
import { scheduleShoppingReminder } from '../utils/notifications';
import { RootStackParamList } from '../navigation/AppNavigator';

// ============================================================
// Types
// ============================================================
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
};

interface Product {
  id: string;
  name: string;
}

// ============================================================
// Screen
// ============================================================
export default function AddProductScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [productName, setProductName] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');

    // Validar que el nombre no esté vacío
    if (!validateProductName(productName)) {
      setError('El nombre del producto no puede estar vacío.');
      return;
    }

    // Agregar producto a AsyncStorage para el usuario activo
    const storageKey = user?.username ? `@shopping_list_${user.username}` : '@shopping_list';
    const raw = await AsyncStorage.getItem(storageKey);
    const products: Product[] = raw ? JSON.parse(raw) : [];
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName.trim(),
    };
    products.push(newProduct);
    await AsyncStorage.setItem(storageKey, JSON.stringify(products));

    // Programar notificación local (dispara en 5 segundos)
    await scheduleShoppingReminder(productName.trim());

    // Volver a HomeScreen
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: theme.shadowColor,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>Nuevo producto</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            ¿Qué necesitás comprar?
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>Nombre del producto</Text>
          <TextInput
            testID="product-name-input"
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
            placeholder="Ej: Leche descremada, Pan integral..."
            placeholderTextColor={theme.inputPlaceholder}
            value={productName}
            onChangeText={setProductName}
            autoFocus
            autoCapitalize="sentences"
          />

          {/* Mensaje de error condicional */}
          {error !== '' && (
            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          )}

          {/* Aviso de recordatorio */}
          <View
            style={[
              styles.reminderContainer,
              {
                backgroundColor: theme.badgeBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.reminderNote, { color: theme.badgeText }]}>
              📣 Recibirás un recordatorio en 5 segundos al guardar
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.buttonPrimary }]}
            onPress={handleSave}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: theme.buttonPrimaryText },
              ]}
            >
              Guardar producto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                borderColor: isDark ? theme.border : theme.border,
                backgroundColor: isDark ? 'rgba(252, 241, 213, 0.08)' : 'transparent',
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: isDark ? theme.text : theme.textSecondary },
              ]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  reminderContainer: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  reminderNote: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
