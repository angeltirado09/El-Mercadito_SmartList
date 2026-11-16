import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as ContactsLegacy from 'expo-contacts/legacy';
import * as Calendar from 'expo-calendar';
import * as CalendarLegacy from 'expo-calendar/legacy';
import { requestResourcePermission } from './permissions';

// ============================================================
// Tipos de Recursos Asociados a un Producto (Lista de Compras)
// ============================================================

export interface StoreLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface SupplierContact {
  id: string;
  name: string;
  phone?: string;
}

export interface CalendarReminderInfo {
  eventId: string;
  dateISO: string;
  title: string;
}

// ============================================================
// 1. Cámara y Galería (expo-image-picker)
// ============================================================

/**
 * Solicita permiso de cámara y permite tomar una foto del producto.
 * Devuelve la URI de la imagen capturada o null si se cancela o el permiso es denegado.
 */
export async function pickProductImageFromCamera(): Promise<string | null> {
  const perm = await requestResourcePermission('camera', {
    showDeniedAlert: true,
  });
  if (perm.status !== 'granted') {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.warn('[El Mercadito] Error al tomar foto con la cámara:', error);
    return null;
  }
}

/**
 * Solicita permiso de galería y permite seleccionar una imagen existente del dispositivo.
 * Devuelve la URI de la imagen seleccionada o null si se cancela o el permiso es denegado.
 */
export async function pickProductImageFromGallery(): Promise<string | null> {
  const perm = await requestResourcePermission('mediaLibrary', {
    showDeniedAlert: true,
  });
  if (perm.status !== 'granted') {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.warn('[El Mercadito] Error al elegir imagen de la galería:', error);
    return null;
  }
}

// ============================================================
// 2. Ubicación GPS del Comercio (expo-location)
// ============================================================

/**
 * Solicita permiso de ubicación en primer plano, obtiene las coordenadas GPS actuales
 * e intenta resolver una dirección aproximada mediante geocodificación inversa.
 */
export async function getCurrentStoreLocation(): Promise<StoreLocation | null> {
  const perm = await requestResourcePermission('location', {
    showDeniedAlert: true,
  });
  if (perm.status !== 'granted') {
    return null;
  }

  try {
    const position = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = position.coords;

    let formattedAddress: string | undefined;
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places && places.length > 0) {
        const place = places[0];
        const parts = [
          place.street
            ? `${place.street}${place.streetNumber ? ` ${place.streetNumber}` : ''}`
            : place.name,
          place.city || place.subregion,
          place.region,
        ].filter(Boolean);

        if (parts.length > 0) {
          formattedAddress = parts.join(', ');
        }
      }
    } catch {
      // Si reverseGeocodeAsync falla (ej: sin conexión), conservamos las coordenadas
    }

    return {
      latitude,
      longitude,
      address:
        formattedAddress ??
        `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  } catch (error) {
    console.warn('[El Mercadito] Error al obtener la ubicación actual:', error);
    return null;
  }
}

// ============================================================
// 3. Selección de Contacto Proveedor (expo-contacts - SDK 57 + Expo Go)
// ============================================================

/**
 * Solicita permiso de contactos y abre el selector de la agenda del dispositivo
 * para asociar un proveedor al producto. Soporta tanto la API nueva (Contact) como
 * el módulo legacy para Expo Go.
 */
export async function pickSupplierContact(): Promise<SupplierContact | null> {
  const perm = await requestResourcePermission('contacts', {
    showDeniedAlert: true,
  });
  if (perm.status !== 'granted') {
    return null;
  }

  try {
    // 1. Intentar con la API moderna de SDK 57 (Contacts.Contact)
    if (Contacts.Contact && typeof Contacts.Contact.presentPicker === 'function') {
      let selectedContact = await Contacts.Contact.presentPicker();

      if (!selectedContact && typeof Contacts.Contact.getAll === 'function') {
        const allContacts = await Contacts.Contact.getAll({ limit: 1 });
        if (allContacts && allContacts.length > 0) {
          selectedContact = allContacts[0];
        }
      }

      if (selectedContact) {
        let name = 'Proveedor sin nombre';
        let phone: string | undefined;

        if (typeof selectedContact.getDetails === 'function') {
          const fields = Contacts.ContactField
            ? [
                Contacts.ContactField.FULL_NAME,
                Contacts.ContactField.GIVEN_NAME,
                Contacts.ContactField.FAMILY_NAME,
                Contacts.ContactField.PHONES,
              ]
            : (['fullName', 'givenName', 'familyName', 'phones'] as unknown as Contacts.ContactField[]);

          const details = await selectedContact.getDetails(fields);
          const composedName = [details.givenName, details.familyName]
            .filter(Boolean)
            .join(' ')
            .trim();
          name = details.fullName || composedName || name;
          phone = details.phones?.[0]?.number;
        } else {
          const raw = selectedContact as unknown as {
            fullName?: string;
            givenName?: string;
            familyName?: string;
            name?: string;
            phones?: Array<{ number?: string }>;
          };
          name =
            raw.fullName ||
            raw.name ||
            [raw.givenName, raw.familyName].filter(Boolean).join(' ').trim() ||
            name;
          phone = raw.phones?.[0]?.number;
        }

        return {
          id: selectedContact.id || Date.now().toString(),
          name,
          phone,
        };
      }
    }
  } catch {
    // Si falla la API Next en Expo Go, continuamos con el fallback legacy
  }

  try {
    // 2. Fallback a expo-contacts/legacy (compatible con Expo Go)
    if (typeof ContactsLegacy.presentContactPickerAsync === 'function') {
      const picked = await ContactsLegacy.presentContactPickerAsync();
      if (picked) {
        return {
          id: picked.id || Date.now().toString(),
          name:
            picked.name ||
            [picked.firstName, picked.lastName].filter(Boolean).join(' ').trim() ||
            'Proveedor sin nombre',
          phone: picked.phoneNumbers?.[0]?.number,
        };
      }
    }

    if (typeof ContactsLegacy.getContactsAsync === 'function') {
      const { data } = await ContactsLegacy.getContactsAsync({ pageSize: 1 });
      if (data && data.length > 0) {
        const first = data[0];
        return {
          id: first.id || Date.now().toString(),
          name:
            first.name ||
            [first.firstName, first.lastName].filter(Boolean).join(' ').trim() ||
            'Proveedor sin nombre',
          phone: first.phoneNumbers?.[0]?.number,
        };
      }
    }

    return null;
  } catch (error) {
    console.warn('[El Mercadito] Error al seleccionar contacto:', error);
    return null;
  }
}

// ============================================================
// 4. Creación de Recordatorio en el Calendario (expo-calendar - SDK 57 + Expo Go)
// ============================================================

/**
 * Solicita permiso de calendario y crea un evento de recordatorio de compra
 * en el calendario del dispositivo para dentro de 1 hora.
 * Compatible tanto con Development Builds (Calendar@next) como con Expo Go (expo-calendar/legacy).
 */
export async function createShoppingCalendarEvent(
  productName: string,
  storeAddress?: string
): Promise<CalendarReminderInfo | null> {
  const perm = await requestResourcePermission('calendar', {
    showDeniedAlert: true,
  });
  if (perm.status !== 'granted') {
    return null;
  }

  const startDate = new Date(Date.now() + 60 * 60 * 1000); // Dentro de 1 hora
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min de duración
  const title = `Comprar: ${productName.trim()}`;
  const notes = `Recordatorio generado desde El Mercadito para comprar ${productName.trim()}.`;

  // 1. Intentar con la API moderna Calendar@next (Development Build / Tests)
  try {
    const calendars = await Calendar.getCalendars();
    let targetCalendar =
      calendars.find((cal) => cal.allowsModifications && cal.isPrimary) ||
      calendars.find((cal) => cal.allowsModifications) ||
      calendars[0];

    if (!targetCalendar && typeof Calendar.createCalendar === 'function') {
      targetCalendar = await Calendar.createCalendar({
        title: 'El Mercadito',
        name: 'El Mercadito',
        color: '#2d6a4f',
        ownerAccount: 'local',
      });
    }

    if (targetCalendar && typeof targetCalendar.createEvent === 'function') {
      const createdEvent = await targetCalendar.createEvent({
        title,
        startDate,
        endDate,
        location: storeAddress,
        notes,
      });

      return {
        eventId: createdEvent?.id || Date.now().toString(),
        dateISO: startDate.toISOString(),
        title,
      };
    }
  } catch {
    // Si estamos en Expo Go, Calendar.getCalendars() lanza stub error y pasamos al módulo legacy
  }

  // 2. Fallback a expo-calendar/legacy (incluido y soportado en Expo Go)
  try {
    const legacyCalendars = await CalendarLegacy.getCalendarsAsync(
      CalendarLegacy.EntityTypes?.EVENT
    );
    let targetLegacy =
      legacyCalendars.find((cal) => cal.allowsModifications && cal.isPrimary) ||
      legacyCalendars.find((cal) => cal.allowsModifications) ||
      legacyCalendars[0];

    let calendarId = targetLegacy?.id;

    if (!calendarId && typeof CalendarLegacy.createCalendarAsync === 'function') {
      calendarId = await CalendarLegacy.createCalendarAsync({
        title: 'El Mercadito',
        name: 'El Mercadito',
        color: '#2d6a4f',
        entityType: CalendarLegacy.EntityTypes?.EVENT,
        accessLevel: CalendarLegacy.CalendarAccessLevel?.OWNER,
        ownerAccount: 'local',
        source:
          Platform.OS === 'android'
            ? { isLocalAccount: true, name: 'El Mercadito', type: 'local' }
            : undefined,
      });
    }

    if (!calendarId) {
      return null;
    }

    const eventId = await CalendarLegacy.createEventAsync(calendarId, {
      title,
      startDate,
      endDate,
      location: storeAddress,
      notes,
    });

    return {
      eventId: eventId || Date.now().toString(),
      dateISO: startDate.toISOString(),
      title,
    };
  } catch (error) {
    console.warn('[El Mercadito] Error al crear evento en el calendario:', error);
    return null;
  }
}
