import React, { useState } from 'react';
import {
  Button,
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
  const [productName, setProductName] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');

    // Validar que el nombre no esté vacío
    if (!validateProductName(productName)) {
      setError('El nombre del producto no puede estar vacío.');
      return;
    }

    // Agregar producto a AsyncStorage
    const raw = await AsyncStorage.getItem('@shopping_list');
    const products: Product[] = raw ? JSON.parse(raw) : [];
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName.trim(),
    };
    products.push(newProduct);
    await AsyncStorage.setItem('@shopping_list', JSON.stringify(products));

    // Programar notificación local (dispara en 5 segundos)
    await scheduleShoppingReminder(productName.trim());

    // Volver a HomeScreen
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Nuevo producto</Text>
          <Text style={styles.subtitle}>¿Qué necesitás comprar?</Text>

          <Text style={styles.label}>Nombre del producto</Text>
          <TextInput
            testID="product-name-input"
            style={styles.input}
            placeholder="Ej: Leche descremada, Pan integral..."
            placeholderTextColor="#adb5bd"
            value={productName}
            onChangeText={setProductName}
            autoFocus
            autoCapitalize="sentences"
          />

          {/* Mensaje de error condicional */}
          {error !== '' && <Text style={styles.errorText}>{error}</Text>}

          {/* Aviso de recordatorio */}
          <View style={styles.reminderContainer}>
            <Text style={styles.reminderNote}>
              📣 Recibirás un recordatorio en 5 segundos al guardar
            </Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar producto</Text>
          </TouchableOpacity>

          <View style={styles.cancelButtonContainer}>
            <Button
              title="Cancelar"
              color="#6c757d"
              onPress={() => navigation.goBack()}
            />
          </View>
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2d6a4f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b2a1f',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1b2a1f',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#e63946',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  reminderContainer: {
    backgroundColor: '#d8f3dc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  reminderNote: {
    fontSize: 13,
    color: '#2d6a4f',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButtonContainer: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
