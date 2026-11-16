import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import * as CalendarLegacy from 'expo-calendar/legacy';
import {
  checkResourcePermission,
  getPermissionStatusLabel,
  requestAllDevicePermissions,
  requestResourcePermission,
} from './permissions';

describe('Manejo de Permisos del Dispositivo (permissions.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('traduce correctamente los estados de permiso (concedido, denegado, pendiente)', () => {
    expect(getPermissionStatusLabel('granted')).toBe('Concedido');
    expect(getPermissionStatusLabel('denied')).toBe('Denegado');
    expect(getPermissionStatusLabel('undetermined')).toBe('Pendiente');
  });

  it('consulta correctamente un permiso en estado pendiente (undetermined)', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });

    const result = await checkResourcePermission('location');
    expect(result.status).toBe('undetermined');
    expect(result.label).toBe('Ubicación (GPS)');
  });

  it('solicita un permiso y devuelve granted cuando el usuario acepta', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
      canAskAgain: true,
    });

    const result = await requestResourcePermission('camera');
    expect(result.status).toBe('granted');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('muestra un mensaje claro al usuario cuando un permiso individual es rechazado (denied)', async () => {
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: true,
    });

    const result = await requestResourcePermission('contacts');
    expect(result.status).toBe('denied');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Permiso de Contactos rechazado',
      expect.stringContaining('El permiso de Contactos fue rechazado'),
      expect.any(Array)
    );
  });

  it('solicita todos los permisos al iniciar sesión/registrarse y avisa si alguno fue rechazado', async () => {
    // Simulamos que calendario aún está pendiente y luego el usuario lo rechaza
    (Calendar.getCalendarPermissions as jest.Mock).mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });
    (Calendar.requestCalendarPermissions as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: true,
    });

    const map = await requestAllDevicePermissions({ showSummaryAlert: true });

    expect(map.camera.status).toBe('granted');
    expect(map.calendar.status).toBe('denied');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Permisos rechazados',
      expect.stringContaining('Calendario'),
      expect.any(Array)
    );
  });

  it('verifica y solicita el permiso de Calendario en Expo Go usando el fallback expo-calendar/legacy', async () => {
    // En Expo Go, Calendar.getCalendarPermissions y requestCalendarPermissions lanzan error
    (Calendar.getCalendarPermissions as jest.Mock).mockRejectedValueOnce(
      new Error('Calendar@next functionality is not available in Expo Go')
    );
    (CalendarLegacy.getCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    const checked = await checkResourcePermission('calendar');
    expect(CalendarLegacy.getCalendarPermissionsAsync).toHaveBeenCalled();
    expect(checked.status).toBe('granted');
  });
});
