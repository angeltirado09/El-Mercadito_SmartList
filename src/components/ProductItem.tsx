import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ============================================================
// Props
// ============================================================
interface Props {
  id: string;
  name: string;
  onDelete: (id: string) => void;
}

// ============================================================
// Componente reutilizable: ProductItem
// ============================================================
/**
 * Muestra un producto de la lista de compras con un botón para eliminarlo.
 * Sigue la paleta de colores del tema activo (Modo Claro / Modo Oscuro).
 *
 * Props:
 *  - id: identificador único del producto
 *  - name: nombre del producto
 *  - onDelete(id): callback invocado al presionar el botón eliminar
 */
export default function ProductItem({ id, name, onDelete }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderLeftColor: theme.accent,
          shadowColor: theme.shadowColor,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🛍️</Text>
      </View>

      <Text
        style={[styles.name, { color: theme.text }]}
        numberOfLines={2}
      >
        {name}
      </Text>

      <TouchableOpacity
        testID="delete-btn"
        onPress={() => onDelete(id)}
        style={[
          styles.deleteButton,
          { backgroundColor: theme.dangerContainer },
        ]}
        accessibilityLabel={`Eliminar ${name}`}
      >
        <Text style={[styles.deleteText, { color: theme.dangerText }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// Estilos
// ============================================================
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
