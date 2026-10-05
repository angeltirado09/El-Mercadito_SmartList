import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { validateAuthInput } from '../utils/validators';

// ============================================================
// Screen
// ============================================================
export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!validateAuthInput(username, password)) {
      setError('Usuario (mín. 3 caracteres) y contraseña (mín. 6 caracteres) son requeridos.');
      return;
    }
    const success = await register(username, password);
    if (!success) {
      setError('Este usuario ya existe. Elegí otro nombre de usuario.');
    }
    // Si success === true, AuthContext actualiza user y AppNavigator redirige a Home automáticamente
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Encabezado */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Unite a El Mercadito y organizá tus compras
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.card}>
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              testID="register-username-input"
              style={styles.input}
              placeholder="Mínimo 3 caracteres"
              placeholderTextColor="#adb5bd"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              testID="register-password-input"
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#adb5bd"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Mensaje de error condicional */}
            {error !== '' && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
              <Text style={styles.primaryButtonText}>Registrarme</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2d6a4f',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b2a1f',
    marginBottom: 6,
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
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#2d6a4f',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
