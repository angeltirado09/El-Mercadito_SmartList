import React, { useState } from 'react';
import {
  Image,
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
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoWrapper,
              {
                borderColor: theme.border,
                shadowColor: theme.shadowColor,
              },
            ]}
          >
            <Image
              source={require('../../assets/images/cart-logo.jpg')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>El Mercadito</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Tu lista de compras inteligente
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
          <Text style={[styles.label, { color: theme.text }]}>Usuario</Text>
          <TextInput
            testID="username-input"
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
            placeholder="Ej: maria123"
            placeholderTextColor={theme.inputPlaceholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.text }]}>Contraseña</Text>
          <TextInput
            testID="password-input"
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
            onPress={handleLogin}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: theme.buttonPrimaryText },
              ]}
            >
              Iniciar sesión
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.buttonSecondaryText },
              ]}
            >
              ¿No tenés cuenta? Registrate
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    marginTop: 4,
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
  secondaryButton: {
    marginTop: 12,
    alignItems: 'center',
    padding: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
