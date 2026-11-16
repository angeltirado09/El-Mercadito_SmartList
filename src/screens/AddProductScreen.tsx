import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateProductName } from '../utils/validators';
import { scheduleShoppingReminder } from '../utils/notifications';
import {
  CalendarReminderInfo,
  createShoppingCalendarEvent,
  getCurrentStoreLocation,
  pickProductImageFromCamera,
  pickProductImageFromGallery,
  pickSupplierContact,
  StoreLocation,
  SupplierContact,
} from '../utils/deviceResources';
import { useProductStore } from '../store/useProductStore';
import { RootStackParamList } from '../navigation/AppNavigator';

// ============================================================
// Types
// ============================================================
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
};

// ============================================================
// Screen
// ============================================================
export default function AddProductScreen({ navigation }: Props) {
  const { user, refreshPermissions } = useAuth();
  const { theme, isDark } = useTheme();
  const addProduct = useProductStore((state) => state.addProduct);

  const [productName, setProductName] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [storeLocation, setStoreLocation] = useState<StoreLocation | undefined>(
    undefined
  );
  const [supplier, setSupplier] = useState<SupplierContact | undefined>(
    undefined
  );
  const [scheduleInCalendar, setScheduleInCalendar] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');

  // 1. Tomar foto con cámara
  const handleTakePhoto = async () => {
    const uri = await pickProductImageFromCamera();
    await refreshPermissions();
    if (uri) {
      setImageUri(uri);
    }
  };

  // 2. Seleccionar foto desde galería
  const handlePickFromGallery = async () => {
    const uri = await pickProductImageFromGallery();
    await refreshPermissions();
    if (uri) {
      setImageUri(uri);
    }
  };

  // 3. Obtener ubicación actual del comercio (GPS)
  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const loc = await getCurrentStoreLocation();
      await refreshPermissions();
      if (loc) {
        setStoreLocation(loc);
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  // 4. Seleccionar contacto proveedor desde la agenda
  const handlePickSupplier = async () => {
    const contact = await pickSupplierContact();
    await refreshPermissions();
    if (contact) {
      setSupplier(contact);
    }
  };

  // Guardar producto en el store global (Zustand) y crear recordatorio en calendario si fue activado
  const handleSave = async () => {
    setError('');

    if (!validateProductName(productName)) {
      setError('El nombre del producto no puede estar vacío.');
      return;
    }

    const trimmedName = productName.trim();
    let calendarReminder: CalendarReminderInfo | undefined;

    if (scheduleInCalendar) {
      const created = await createShoppingCalendarEvent(
        trimmedName,
        storeLocation?.address
      );
      await refreshPermissions();
      if (created) {
        calendarReminder = created;
      }
    }

    await addProduct(
      {
        name: trimmedName,
        imageUri,
        location: storeLocation,
        supplier,
        calendarReminder,
      },
      user?.username ?? null
    );

    // Programar notificación local (dispara en 5 segundos)
    await scheduleShoppingReminder(trimmedName);

    // Volver a HomeScreen
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
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
            <Text style={[styles.title, { color: theme.text }]}>
              Nuevo producto
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              ¿Qué necesitás comprar? Asociá foto, comercio, proveedor o recordatorio.
            </Text>

            {/* Nombre del producto */}
            <Text style={[styles.label, { color: theme.text }]}>
              Nombre del producto *
            </Text>
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

            {/* Sección 1: Cámara y Galería */}
            <Text style={[styles.label, { color: theme.text }]}>
              Foto del producto (Cámara / Galería)
            </Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                testID="camera-btn"
                style={[
                  styles.resourceButton,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera-outline" size={18} color={theme.text} />
                <Text style={[styles.resourceButtonText, { color: theme.text }]}>
                  Cámara
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="gallery-btn"
                style={[
                  styles.resourceButton,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
                onPress={handlePickFromGallery}
              >
                <Ionicons name="images-outline" size={18} color={theme.text} />
                <Text style={[styles.resourceButtonText, { color: theme.text }]}>
                  Galería
                </Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View
                style={[
                  styles.previewBox,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Image
                  testID="selected-image-preview"
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                />
                <View style={styles.previewTextCol}>
                  <Text style={[styles.previewLabel, { color: theme.text }]}>
                    Imagen adjuntada
                  </Text>
                  <TouchableOpacity onPress={() => setImageUri(undefined)}>
                    <Text style={[styles.removeLink, { color: theme.danger }]}>
                      Quitar foto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sección 2: Ubicación del comercio (GPS) */}
            <Text style={[styles.label, { color: theme.text }]}>
              Ubicación del comercio (GPS)
            </Text>
            <TouchableOpacity
              testID="location-btn"
              style={[
                styles.fullResourceButton,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                },
              ]}
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              <Ionicons name="location-outline" size={18} color={theme.text} />
              <Text style={[styles.resourceButtonText, { color: theme.text }]}>
                {loadingLocation
                  ? 'Obteniendo ubicación GPS...'
                  : storeLocation
                  ? `📍 ${storeLocation.address}`
                  : 'Asociar ubicación actual del comercio'}
              </Text>
            </TouchableOpacity>

            {/* Sección 3: Contacto relacionado (Proveedor) */}
            <Text style={[styles.label, { color: theme.text }]}>
              Contacto relacionado (Proveedor)
            </Text>
            <TouchableOpacity
              testID="contact-btn"
              style={[
                styles.fullResourceButton,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                },
              ]}
              onPress={handlePickSupplier}
            >
              <Ionicons name="people-outline" size={18} color={theme.text} />
              <Text style={[styles.resourceButtonText, { color: theme.text }]}>
                {supplier
                  ? `👤 ${supplier.name}${supplier.phone ? ` (${supplier.phone})` : ''}`
                  : 'Seleccionar proveedor de Contactos'}
              </Text>
            </TouchableOpacity>

            {/* Sección 4: Recordatorio en el Calendario */}
            <View
              style={[
                styles.calendarSwitchRow,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.calendarTextCol}>
                <Text style={[styles.calendarTitle, { color: theme.text }]}>
                  📅 Agendar en el Calendario
                </Text>
                <Text
                  style={[styles.calendarSubtitle, { color: theme.textSecondary }]}
                >
                  Crea un evento recordatorio en el calendario de tu dispositivo
                </Text>
              </View>
              <Switch
                testID="calendar-switch"
                value={scheduleInCalendar}
                onValueChange={setScheduleInCalendar}
              />
            </View>

            {/* Mensaje de error condicional */}
            {error !== '' && (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {error}
              </Text>
            )}

            {/* Aviso de notificación local */}
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
              testID="save-product-btn"
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
                  borderColor: theme.border,
                  backgroundColor: isDark
                    ? 'rgba(252, 241, 213, 0.08)'
                    : 'transparent',
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
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  resourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  fullResourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  resourceButtonText: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  previewImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  previewTextCol: {
    flex: 1,
    gap: 4,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  calendarSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 14,
    gap: 10,
  },
  calendarTextCol: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  calendarSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  reminderContainer: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  reminderNote: {
    fontSize: 12,
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
