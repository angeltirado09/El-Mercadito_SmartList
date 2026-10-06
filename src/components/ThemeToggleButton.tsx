import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * Botón para alternar entre Modo Claro y Modo Oscuro con íconos vectoriales.
 *
 * Los íconos y sus contenedores hacen juego con el fondo:
 * - En modo oscuro (header crema): ícono de sol ('sunny') en borgoña (#6d0d18) para cambiar a claro.
 * - En modo claro (header borgoña): ícono de luna ('moon') en crema (#fcf1d5) para cambiar a oscuro.
 */
export default function ThemeToggleButton() {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      testID="theme-toggle-btn"
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          backgroundColor: isDark
            ? 'rgba(109, 13, 24, 0.12)'
            : 'rgba(252, 241, 213, 0.18)',
          borderColor: isDark
            ? 'rgba(109, 13, 24, 0.25)'
            : 'rgba(252, 241, 213, 0.35)',
        },
      ]}
      accessibilityLabel={isDark ? 'Cambiar al modo claro' : 'Cambiar al modo oscuro'}
      accessibilityHint="Alterna entre el modo claro y el modo oscuro"
      accessibilityRole="button"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        testID={isDark ? 'sun-icon' : 'moon-icon'}
        name={isDark ? 'sunny' : 'moon'}
        size={21}
        color={theme.headerText}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});
