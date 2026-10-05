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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { validateAuthInput } from '../utils/validators';
import { RootStackParamList } from '../navigation/AppNavigator';

// ============================================================
// Types
// ============================================================
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

// ============================================================
// Screen
// ============================================================
export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!validateAuthInput(username, password)) {
      setError('Usuario (mín. 3 caracteres) y contraseña (mín. 6 caracteres) son requeridos.');
      return;
    }
    const success = await login(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos. Verificá tus datos.');
    }
    // Si success === true, AuthContext actualiza user y AppNavigator redirige a Home
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🛒</Text>
          <Text style={styles.appName}>El Mercadito</Text>
          <Text style={styles.tagline}>Tu lista de compras inteligente</Text>
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            testID="username-input"
            style={styles.input}
            placeholder="Ej: maria123"
            placeholderTextColor="#adb5bd"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            testID="password-input"
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#adb5bd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Mensaje de error condicional */}
          {error !== '' && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>¿No tenés cuenta? Registrate</Text>
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d6a4f',
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
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
  secondaryButton: {
    marginTop: 12,
    alignItems: 'center',
    padding: 10,
  },
  secondaryButtonText: {
    color: '#52b788',
    fontSize: 14,
    fontWeight: '600',
  },
});
