/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  getMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file:///mock/camera-photo.jpg' }],
    })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file:///mock/gallery-photo.jpg' }],
    })
  ),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: -34.6037,
        longitude: -58.3816,
      },
    })
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([
      {
        street: 'Av. Corrientes',
        streetNumber: '1234',
        city: 'Buenos Aires',
        region: 'CABA',
      },
    ])
  ),
}));

jest.mock('expo-contacts', () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  ContactField: {
    FULL_NAME: 'fullName',
    GIVEN_NAME: 'givenName',
    FAMILY_NAME: 'familyName',
    PHONES: 'phones',
  },
  Contact: {
    presentPicker: jest.fn(() =>
      Promise.resolve({
        id: 'contact-1',
        getDetails: jest.fn(() =>
          Promise.resolve({
            id: 'contact-1',
            fullName: 'Distribuidora Sur',
            givenName: 'Distribuidora',
            familyName: 'Sur',
            phones: [{ id: 'p1', number: '+5491122334455' }],
          })
        ),
      })
    ),
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('expo-contacts/legacy', () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  presentContactPickerAsync: jest.fn(() =>
    Promise.resolve({
      id: 'contact-legacy-1',
      name: 'Distribuidora Sur',
      phoneNumbers: [{ id: 'p1', number: '+5491122334455' }],
    })
  ),
  getContactsAsync: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('expo-calendar', () => ({
  getCalendarPermissions: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestCalendarPermissions: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  getCalendars: jest.fn(() =>
    Promise.resolve([
      {
        id: 'cal-1',
        title: 'Mi Calendario',
        allowsModifications: true,
        isPrimary: true,
        createEvent: jest.fn(() => Promise.resolve({ id: 'event-101' })),
      },
    ])
  ),
  createCalendar: jest.fn(() =>
    Promise.resolve({
      id: 'cal-created',
      title: 'El Mercadito',
      allowsModifications: true,
      isPrimary: true,
      createEvent: jest.fn(() => Promise.resolve({ id: 'event-202' })),
    })
  ),
}));

jest.mock('expo-calendar/legacy', () => ({
  EntityTypes: { EVENT: 'event', REMINDER: 'reminder' },
  CalendarAccessLevel: { OWNER: 'owner' },
  getCalendarPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestCalendarPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  getCalendarsAsync: jest.fn(() =>
    Promise.resolve([
      {
        id: 'cal-legacy-1',
        title: 'Mi Calendario',
        allowsModifications: true,
        isPrimary: true,
      },
    ])
  ),
  createCalendarAsync: jest.fn(() => Promise.resolve('cal-legacy-created')),
  createEventAsync: jest.fn(() => Promise.resolve('event-legacy-101')),
}));

jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true, granted: true })
  ),
}));
