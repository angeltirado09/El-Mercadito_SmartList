import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import {
  createShoppingCalendarEvent,
  getCurrentStoreLocation,
  pickProductImageFromCamera,
  pickProductImageFromGallery,
  pickSupplierContact,
} from './deviceResources';

describe('Acceso a Recursos del Dispositivo (deviceResources.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  // ------------------------------------------------------------
  // 1. Cámara y Galería
  // ------------------------------------------------------------
  it('toma una foto con la cámara cuando el permiso es concedido', async () => {
    const uri = await pickProductImageFromCamera();
    expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    expect(uri).toBe('file:///mock/camera-photo.jpg');
  });

  it('selecciona una imagen de la galería cuando el permiso es concedido', async () => {
    const uri = await pickProductImageFromGallery();
    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(uri).toBe('file:///mock/gallery-photo.jpg');
  });

  it('retorna null y avisa al usuario si se rechaza el permiso de cámara', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: true,
    });

    const uri = await pickProductImageFromCamera();
    expect(uri).toBeNull();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // 2. Ubicación (GPS)
  // ------------------------------------------------------------
  it('obtiene las coordenadas actuales y la dirección del comercio con expo-location', async () => {
    const location = await getCurrentStoreLocation();
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith({
      latitude: -34.6037,
      longitude: -58.3816,
    });
    expect(location).toEqual({
      latitude: -34.6037,
      longitude: -58.3816,
      address: 'Av. Corrientes 1234, Buenos Aires, CABA',
    });
  });

  // ------------------------------------------------------------
  // 3. Contactos (Proveedor)
  // ------------------------------------------------------------
  it('selecciona un contacto proveedor desde la agenda con expo-contacts', async () => {
    const supplier = await pickSupplierContact();
    expect(Contacts.requestPermissionsAsync).toHaveBeenCalled();
    expect(Contacts.Contact.presentPicker).toHaveBeenCalled();
    expect(supplier).toEqual({
      id: 'contact-1',
      name: 'Distribuidora Sur',
      phone: '+5491122334455',
    });
  });

  // ------------------------------------------------------------
  // 4. Calendario (Recordatorio)
  // ------------------------------------------------------------
  it('crea un evento recordatorio en el calendario del dispositivo con expo-calendar', async () => {
    const reminder = await createShoppingCalendarEvent(
      'Yerba Mate 1kg',
      'Av. Corrientes 1234'
    );
    expect(Calendar.requestCalendarPermissions).toHaveBeenCalled();
    expect(Calendar.getCalendars).toHaveBeenCalled();
    expect(reminder).toEqual({
      eventId: 'event-101',
      dateISO: expect.any(String),
      title: 'Comprar: Yerba Mate 1kg',
    });
  });
});

