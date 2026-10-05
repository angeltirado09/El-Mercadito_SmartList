import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
 *
 * Props:
 *  - id: identificador único del producto
 *  - name: nombre del producto
 *  - onDelete(id): callback invocado al presionar el botón eliminar
 */
export default function ProductItem({ id, name, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🛍️</Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>

      <TouchableOpacity
        testID="delete-btn"
        onPress={() => onDelete(id)}
        style={styles.deleteButton}
        accessibilityLabel={`Eliminar ${name}`}
      >
        <Text style={styles.deleteText}>✕</Text>
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
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#52b788',
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
    fontWeight: '500',
    color: '#1b2a1f',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffe8e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: {
    color: '#e63946',
    fontSize: 14,
    fontWeight: '700',
  },
});
