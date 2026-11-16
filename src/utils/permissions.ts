import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as ContactsLegacy from 'expo-contacts/legacy';
import * as Calendar from 'expo-calendar';
import * as CalendarLegacy from 'expo-calendar/legacy';
import {
  getPermissionsAsync as getNotificationPermissionsAsync,
  requestPermissionsAsync as requestNotificationPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';

// ============================================================
// Tipos de Permisos y Recursos del Dispositivo
// ============================================================

/**
 * Estados posibles de un permiso en la aplicación:
 * - 'granted': Concedido
 * - 'denied': Denegado
 * - 'undetermined': Pendiente (aún no consultado)
 */
export type AppPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type DeviceResource =
  | 'camera'
  | 'mediaLibrary'
  | 'location'
  | 'contacts'
  | 'calendar'
  | 'notifications';

export interface PermissionDetail {
  resource: DeviceResource;
  label: string;
  description: string;
  status: AppPermissionStatus;
  canAskAgain: boolean;
}

export type DevicePermissionsMap = Record<DeviceResource, PermissionDetail>;

export const RESOURCE_METADATA: Record<
  DeviceResource,
  { label: string; description: string; deniedMessage: string }
> = {
  camera: {
    label: 'Cámara',
    description: 'Tomar fotos de los productos de tu lista',
    deniedMessage:
      'El permiso de Cámara fue rechazado. No podrás tomar fotos nuevas de los productos hasta que lo habilites.',
  },
  mediaLibrary: {
    label: 'Galería de imágenes',
    description: 'Seleccionar fotos de productos desde tu galería',
    deniedMessage:
      'El permiso de Galería fue rechazado. No podrás elegir imágenes existentes de tu dispositivo.',
  },
  location: {
    label: 'Ubicación (GPS)',
    description: 'Asociar la ubicación del comercio donde comprar cada producto',
    deniedMessage:
      'El permiso de Ubicación fue rechazado. No podrás adjuntar las coordenadas o dirección del comercio a tus productos.',
  },
  contacts: {
    label: 'Contactos',
    description: 'Vincular un contacto o proveedor de tu agenda a un producto',
    deniedMessage:
      'El permiso de Contactos fue rechazado. No podrás seleccionar proveedores desde la agenda de tu dispositivo.',
  },
  calendar: {
    label: 'Calendario',
    description: 'Crear recordatorios y eventos de compra en tu calendario',
    deniedMessage:
      'El permiso de Calendario fue rechazado. No podrás agendar recordatorios de compra en el calendario del dispositivo.',
  },
  notifications: {
    label: 'Notificaciones',
    description: 'Recibir alertas locales sobre tus compras pendientes',
    deniedMessage:
      'El permiso de Notificaciones fue rechazado. No recibirás avisos locales al guardar productos.',
  },
};

/**
 * Traduce el estado técnico del permiso a una etiqueta legible para el usuario.
 */
export function getPermissionStatusLabel(status: AppPermissionStatus): string {
  switch (status) {
    case 'granted':
      return 'Concedido';
    case 'denied':
      return 'Denegado';
    case 'undetermined':
    default:
      return 'Pendiente';
  }
}

/**
 * Normaliza la respuesta de los módulos de Expo a AppPermissionStatus.
 */
function normalizeStatus(
  rawStatus?: string,
  granted?: boolean
): AppPermissionStatus {
  if (granted === true || rawStatus === 'granted') return 'granted';
  if (rawStatus === 'denied') return 'denied';
  return 'undetermined';
}

// ============================================================
// Helpers de compatibilidad SDK 57 (Development Build + Expo Go)
// En Expo SDK 57, `expo-calendar` (Calendar@next) lanza un stub error dentro
// de Expo Go, mientras que `expo-calendar/legacy` usa el módulo nativo `ExpoCalendar`
// que sí está incluido y operativo en Expo Go.
// ============================================================

async function getCalendarPermissionCompat(): Promise<{
  status?: string;
  granted?: boolean;
  canAskAgain?: boolean;
}> {
  try {
    if (typeof Calendar.getCalendarPermissions === 'function') {
      return await Calendar.getCalendarPermissions();
    }
  } catch {
    // Fallback a expo-calendar/legacy cuando se ejecuta en Expo Go
  }
  return await CalendarLegacy.getCalendarPermissionsAsync();
}

async function requestCalendarPermissionCompat(): Promise<{
  status?: string;
  granted?: boolean;
  canAskAgain?: boolean;
}> {
  try {
    if (typeof Calendar.requestCalendarPermissions === 'function') {
      return await Calendar.requestCalendarPermissions();
    }
  } catch {
    // Fallback a expo-calendar/legacy cuando se ejecuta en Expo Go
  }
  return await CalendarLegacy.requestCalendarPermissionsAsync();
}

async function getContactsPermissionCompat(): Promise<{
  status?: string;
  granted?: boolean;
  canAskAgain?: boolean;
}> {
  try {
    if (typeof Contacts.getPermissionsAsync === 'function') {
      return await Contacts.getPermissionsAsync();
    }
  } catch {
    // Fallback a expo-contacts/legacy si fuera necesario
  }
  return await ContactsLegacy.getPermissionsAsync();
}

async function requestContactsPermissionCompat(): Promise<{
  status?: string;
  granted?: boolean;
  canAskAgain?: boolean;
}> {
  try {
    if (typeof Contacts.requestPermissionsAsync === 'function') {
      return await Contacts.requestPermissionsAsync();
    }
  } catch {
    // Fallback a expo-contacts/legacy si fuera necesario
  }
  return await ContactsLegacy.requestPermissionsAsync();
}

/**
 * Crea el estado inicial (pendiente) de todos los permisos.
 */
export function createInitialPermissionsMap(): DevicePermissionsMap {
  return {
    camera: {
      resource: 'camera',
      label: RESOURCE_METADATA.camera.label,
      description: RESOURCE_METADATA.camera.description,
      status: 'undetermined',
      canAskAgain: true,
    },
    mediaLibrary: {
      resource: 'mediaLibrary',
      label: RESOURCE_METADATA.mediaLibrary.label,
      description: RESOURCE_METADATA.mediaLibrary.description,
      status: 'undetermined',
      canAskAgain: true,
    },
    location: {
      resource: 'location',
      label: RESOURCE_METADATA.location.label,
      description: RESOURCE_METADATA.location.description,
      status: 'undetermined',
      canAskAgain: true,
    },
    contacts: {
      resource: 'contacts',
      label: RESOURCE_METADATA.contacts.label,
      description: RESOURCE_METADATA.contacts.description,
      status: 'undetermined',
      canAskAgain: true,
    },
    calendar: {
      resource: 'calendar',
      label: RESOURCE_METADATA.calendar.label,
      description: RESOURCE_METADATA.calendar.description,
      status: 'undetermined',
      canAskAgain: true,
    },
    notifications: {
      resource: 'notifications',
      label: RESOURCE_METADATA.notifications.label,
      description: RESOURCE_METADATA.notifications.description,
      status: 'undetermined',
      canAskAgain: true,
    },
  };
}

// ============================================================
// Consultas y Solicitudes Individuales por Recurso (SDK 57)
// ============================================================

/**
 * Consulta el estado actual de un recurso sin mostrar el diálogo del sistema.
 */
export async function checkResourcePermission(
  resource: DeviceResource
): Promise<PermissionDetail> {
  const meta = RESOURCE_METADATA[resource];
  try {
    switch (resource) {
      case 'camera': {
        const res = await ImagePicker.getCameraPermissionsAsync();
        return {
          resource,
          label: meta.label,
          description: meta.description,
          status: normalizeStatus(res?.status, res?.granted),
          canAskAgain: res?.canAskAgain ?? true,
        };
      }
      case 'mediaLibrary': {
        const res = await ImagePicker.getMediaLibraryPermissionsAsync();
        return {
          resource,
          label: meta.label,
          description: meta.description,
          status: normalizeStatus(res?.status, res?.granted),
          canAskAgain: res?.canAskAgain ?? true,
        };
      }
      case 'location': {
        const res = await Location.getForegroundPermissionsAsync();
        return {
          resource,
          label: meta.label,
          description: meta.description,
          status: normalizeStatus(res?.status, res?.granted),
          canAskAgain: res?.canAskAgain ?? true,
        };
      }
      case 'contacts': {
        const res = await getContactsPermissionCompat();
        return {
          resource,
          label: meta.label,
          description: meta.description,
          status: normalizeStatus(res?.status, res?.granted),
          canAskAgain: res?.canAskAgain ?? true,
        };
      }
      case 'calendar': {
        const res = await getCalendarPermissionCompat();
        return {
          resource,
          label: meta.label,
          description: meta.description,
          status: normalizeStatus(res?.status, res?.granted),
          canAskAgain: res?.canAskAgain ?? true,
        };
      }
      case 'notifications': {
        const res = await getNotificationPermissionsAsync();
        return {
          resource,
          label: meta.label,
          description: meta.description,
          status: normalizeStatus(res?.status, res?.granted),
          canAskAgain: res?.canAskAgain ?? true,
        };
      }
    }
  } catch (error) {
    console.warn(`[El Mercadito] Error verificando permiso de ${resource}:`, error);
    return {
      resource,
      label: meta.label,
      description: meta.description,
      status: 'undetermined',
      canAskAgain: true,
    };
  }
}

/**
 * Solicita el permiso de un recurso específico al sistema operativo.
 * Si showDeniedAlert es true y el permiso resulta denegado, muestra una alerta clara al usuario.
 */
export async function requestResourcePermission(
  resource: DeviceResource,
  options: { showDeniedAlert?: boolean } = { showDeniedAlert: true }
): Promise<PermissionDetail> {
  const meta = RESOURCE_METADATA[resource];
  try {
    let rawResponse:
      | { status?: string; granted?: boolean; canAskAgain?: boolean }
      | undefined;

    switch (resource) {
      case 'camera':
        rawResponse = await ImagePicker.requestCameraPermissionsAsync();
        break;
      case 'mediaLibrary':
        rawResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
        break;
      case 'location':
        rawResponse = await Location.requestForegroundPermissionsAsync();
        break;
      case 'contacts':
        rawResponse = await requestContactsPermissionCompat();
        break;
      case 'calendar':
        rawResponse = await requestCalendarPermissionCompat();
        break;
      case 'notifications':
        rawResponse = await requestNotificationPermissionsAsync();
        break;
    }

    const status = normalizeStatus(rawResponse?.status, rawResponse?.granted);
    const canAskAgain = rawResponse?.canAskAgain ?? true;

    if (status === 'denied' && options.showDeniedAlert) {
      showPermissionDeniedAlert(resource, canAskAgain);
    }

    return {
      resource,
      label: meta.label,
      description: meta.description,
      status,
      canAskAgain,
    };
  } catch (error) {
    console.warn(`[El Mercadito] No se pudo solicitar permiso de ${resource}:`, error);
    return {
      resource,
      label: meta.label,
      description: meta.description,
      status: 'denied',
      canAskAgain: false,
    };
  }
}

/**
 * Muestra un mensaje claro al usuario cuando un permiso es rechazado,
 * ofreciendo abrir la configuración del dispositivo si ya no se puede volver a preguntar.
 */
export function showPermissionDeniedAlert(
  resource: DeviceResource,
  canAskAgain = true
): void {
  const meta = RESOURCE_METADATA[resource];

  if (!canAskAgain) {
    Alert.alert(
      `Permiso de ${meta.label} denegado`,
      `${meta.deniedMessage}\n\nPodés habilitarlo manualmente desde la Configuración de tu dispositivo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir Configuración',
          onPress: () => {
            Linking.openSettings().catch(() => {});
          },
        },
      ]
    );
  } else {
    Alert.alert(`Permiso de ${meta.label} rechazado`, meta.deniedMessage, [
      { text: 'Entendido' },
    ]);
  }
}

// ============================================================
// Solicitud y Consulta Masiva (Al Iniciar Sesión o Registrarse)
// ============================================================

const ALL_RESOURCES: DeviceResource[] = [
  'camera',
  'mediaLibrary',
  'location',
  'contacts',
  'calendar',
  'notifications',
];

/**
 * Obtiene el estado actual de todos los permisos del dispositivo sin lanzar prompts.
 */
export async function getAllDevicePermissions(): Promise<DevicePermissionsMap> {
  const map = createInitialPermissionsMap();
  for (const resource of ALL_RESOURCES) {
    map[resource] = await checkResourcePermission(resource);
  }
  return map;
}

/**
 * Solicita secuencialmente todos los permisos de los recursos del dispositivo
 * al iniciar sesión o registrarse.
 * Si uno o más permisos son rechazados, muestra un aviso claro al usuario.
 */
export async function requestAllDevicePermissions(
  options: { showSummaryAlert?: boolean } = { showSummaryAlert: true }
): Promise<DevicePermissionsMap> {
  const map = createInitialPermissionsMap();

  for (const resource of ALL_RESOURCES) {
    // Primero consultamos si ya está concedido para evitar prompts innecesarios
    const current = await checkResourcePermission(resource);
    if (current.status === 'granted') {
      map[resource] = current;
    } else {
      map[resource] = await requestResourcePermission(resource, {
        showDeniedAlert: false,
      });
    }
  }

  if (options.showSummaryAlert) {
    const deniedList = ALL_RESOURCES.map((r) => map[r]).filter(
      (detail) => detail.status === 'denied'
    );

    if (deniedList.length > 0) {
      const rejectedNames = deniedList.map((d) => `• ${d.label}`).join('\n');
      Alert.alert(
        'Permisos rechazados',
        `Los siguientes permisos fueron denegados:\n\n${rejectedNames}\n\nAlgunas funciones como tomar fotos, guardar la ubicación del comercio, asociar un proveedor o crear recordatorios en el calendario no estarán disponibles hasta que los concedas.`,
        [
          { text: 'Continuar', style: 'cancel' },
          {
            text: 'Configuración',
            onPress: () => {
              Linking.openSettings().catch(() => {});
            },
          },
        ]
      );
    }
  }

  return map;
}
