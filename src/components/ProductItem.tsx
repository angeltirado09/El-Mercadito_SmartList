import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarReminderInfo,
  StoreLocation,
  SupplierContact,
} from '../utils/deviceResources';

// ============================================================
// Props
// ============================================================
export interface Props {
  id: string;
  name: string;
  completed?: boolean;
  imageUri?: string;
  location?: StoreLocation;
  supplier?: SupplierContact;
  calendarReminder?: CalendarReminderInfo;
  onDelete: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

// ============================================================
// Componente reutilizable: ProductItem
// ============================================================
/**
 * Muestra un producto de la lista de compras junto con sus recursos asociados:
 *  - Foto del producto (cámara / galería)
 *  - Ubicación del comercio (GPS)
 *  - Contacto relacionado (proveedor)
 *  - Recordatorio agendado en el calendario
 */
export default function ProductItem({
  id,
  name,
  completed = false,
  imageUri,
  location,
  supplier,
  calendarReminder,
  onDelete,
  onToggleComplete,
}: Props) {
  const { theme } = useTheme();

  const hasMetadata = Boolean(location || supplier || calendarReminder);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderLeftColor: completed ? theme.textSecondary : theme.accent,
          shadowColor: theme.shadowColor,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {/* Miniatura de imagen del producto o ícono por defecto */}
      <TouchableOpacity
        testID={`toggle-product-${id}`}
        activeOpacity={onToggleComplete ? 0.7 : 1}
        onPress={onToggleComplete ? () => onToggleComplete(id) : undefined}
        style={styles.mainRow}
      >
        <View style={styles.iconContainer}>
          {imageUri ? (
            <Image
              testID="product-image"
              source={{ uri: imageUri }}
              style={[styles.productThumbnail, { borderColor: theme.border }]}
            />
          ) : (
            <Text style={styles.icon}>{completed ? '✅' : '🛍️'}</Text>
          )}
        </View>

        <View style={styles.infoColumn}>
          <Text
            style={[
              styles.name,
              {
                color: theme.text,
                textDecorationLine: completed ? 'line-through' : 'none',
                opacity: completed ? 0.65 : 1,
              },
            ]}
            numberOfLines={2}
          >
            {name}
          </Text>

          {hasMetadata && (
            <View style={styles.metadataContainer}>
              {location && (
                <Text
                  testID="product-location"
                  style={[styles.metaText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  📍 Comercio:{' '}
                  {location.address ||
                    `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </Text>
              )}

              {supplier && (
                <Text
                  testID="product-supplier"
                  style={[styles.metaText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  👤 Proveedor: {supplier.name}
                  {supplier.phone ? ` (${supplier.phone})` : ''}
                </Text>
              )}

              {calendarReminder && (
                <Text
                  testID="product-calendar"
                  style={[styles.metaText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  📅 Recordatorio agendado en calendario
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

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
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  productThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoColumn: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  metadataContainer: {
    marginTop: 5,
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
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
