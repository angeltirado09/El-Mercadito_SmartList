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
import { useTheme } from '../context/ThemeContext';
import { validateAuthInput } from '../utils/validators';

// ============================================================
// Screen
// ============================================================
export default function RegisterScreen() {
  const { register } = useAuth();
  const { theme } = useTheme();
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Encabezado */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.text }]}>Crear cuenta</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Unite a El Mercadito y organizá tus compras
            </Text>
          </View>

          {/* Formulario */}
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
            <Text style={[styles.label, { color: theme.text }]}>Nombre de usuario</Text>
            <TextInput
              testID="register-username-input"
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                },
              ]}
              placeholder="Mínimo 3 caracteres"
              placeholderTextColor={theme.inputPlaceholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: theme.text }]}>Contraseña</Text>
            <TextInput
              testID="register-password-input"
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                },
              ]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.inputPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Mensaje de error condicional */}
            {error !== '' && (
              <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.buttonPrimary }]}
              onPress={handleRegister}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.buttonPrimaryText },
                ]}
              >
                Registrarme
              </Text>
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
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
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
    lineHeight: 18,
  },
  primaryButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
