import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProductStore } from '../useProductStore';

describe('Estado Global de Productos con Zustand (useProductStore)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useProductStore.getState().clearProducts();
    jest.clearAllMocks();
  });

  it('agrega un producto con foto, ubicación, proveedor y recordatorio de calendario', async () => {
    const created = await useProductStore.getState().addProduct(
      {
        name: 'Aceite de Oliva',
        imageUri: 'file:///mock/aceite.jpg',
        location: {
          latitude: -34.6037,
          longitude: -58.3816,
          address: 'Av. Corrientes 1234',
        },
        supplier: {
          id: 'c-10',
          name: 'Mayorista Norte',
          phone: '+5491144556677',
        },
        calendarReminder: {
          eventId: 'evt-99',
          dateISO: '2026-11-11T15:00:00.000Z',
          title: 'Comprar: Aceite de Oliva',
        },
      },
      'ana'
    );

    const state = useProductStore.getState();
    expect(state.products).toHaveLength(1);
    expect(state.products[0]).toMatchObject({
      id: created.id,
      name: 'Aceite de Oliva',
      completed: false,
      imageUri: 'file:///mock/aceite.jpg',
      location: { address: 'Av. Corrientes 1234' },
      supplier: { name: 'Mayorista Norte' },
      calendarReminder: { eventId: 'evt-99' },
    });

    // Verificar persistencia en AsyncStorage para el usuario activo
    const stored = await AsyncStorage.getItem('@shopping_list_ana');
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it('actualiza un producto existente en el store global (updateProduct)', async () => {
    const item = await useProductStore
      .getState()
      .addProduct({ name: 'Arroz Integral' }, 'ana');

    await useProductStore
      .getState()
      .updateProduct(item.id, { completed: true, name: 'Arroz Integral 1kg' }, 'ana');

    const updated = useProductStore.getState().products[0];
    expect(updated.completed).toBe(true);
    expect(updated.name).toBe('Arroz Integral 1kg');
  });

  it('elimina un producto del store global y de AsyncStorage (deleteProduct)', async () => {
    const item1 = await useProductStore
      .getState()
      .addProduct({ name: 'Leche' }, 'ana');
    const item2 = await useProductStore
      .getState()
      .addProduct({ name: 'Café' }, 'ana');

    expect(useProductStore.getState().products).toHaveLength(2);

    await useProductStore.getState().deleteProduct(item1.id, 'ana');

    const remaining = useProductStore.getState().products;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(item2.id);

    const stored = await AsyncStorage.getItem('@shopping_list_ana');
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it('carga los productos del usuario correspondiente desde AsyncStorage (loadProducts)', async () => {
    await AsyncStorage.setItem(
      '@shopping_list_carlos',
      JSON.stringify([{ id: 'p-1', name: 'Queso rallado', completed: false }])
    );

    await useProductStore.getState().loadProducts('carlos');

    expect(useProductStore.getState().activeUsername).toBe('carlos');
    expect(useProductStore.getState().products).toEqual([
      { id: 'p-1', name: 'Queso rallado', completed: false },
    ]);
  });
});

