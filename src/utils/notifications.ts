import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

// ============================================================
// Configuración del handler de notificaciones en primer plano
// SDK 57: shouldShowBanner + shouldShowList reemplazan a shouldShowAlert
// ============================================================
try {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn('[El Mercadito] Error configurando notification handler:', e);
}

/**
 * Solicita permisos de notificación al usuario.
 * Seguro para llamar en Expo Go y en builds nativos.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('[El Mercadito] Permisos de notificación no disponibles:', e);
    return false;
  }
}

/**
 * Programa una notificación local de recordatorio de compra.
 * Se dispara 5 segundos después de ser llamada.
 *
 * @param productName - Nombre del producto a recordar
 */
export async function scheduleShoppingReminder(productName: string): Promise<void> {
  try {
    await scheduleNotificationAsync({
      content: {
        title: '🛒 Recordatorio de compra',
        body: `No olvides comprar: ${productName}`,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });
  } catch (e) {
    console.warn('[El Mercadito] No se pudo programar la notificación:', e);
  }
}
