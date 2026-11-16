import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  CalendarReminderInfo,
  StoreLocation,
  SupplierContact,
} from '../utils/deviceResources';

// ============================================================
// Tipos del Producto y del Store Global (Zustand)
// ============================================================

export interface Product {
  id: string;
  name: string;
  completed?: boolean;
  imageUri?: string;
  location?: StoreLocation;
  supplier?: SupplierContact;
  calendarReminder?: CalendarReminderInfo;
}

export interface ProductStoreState {
  products: Product[];
  activeUsername: string | null;
  loadProducts: (username: string | null) => Promise<void>;
  addProduct: (
    data: Omit<Product, 'id'>,
    username?: string | null
  ) => Promise<Product>;
  updateProduct: (
    id: string,
    changes: Partial<Omit<Product, 'id'>>,
    username?: string | null
  ) => Promise<void>;
  deleteProduct: (id: string, username?: string | null) => Promise<void>;
  clearProducts: () => void;
}

function getStorageKey(username?: string | null): string {
  return username ? `@shopping_list_${username}` : '@shopping_list';
}

export const useProductStore = create<ProductStoreState>((set, get) => ({
  products: [],
  activeUsername: null,

  loadProducts: async (username: string | null) => {
    if (!username) {
      set({ products: [], activeUsername: null });
      return;
    }

    const storageKey = getStorageKey(username);
    const raw = await AsyncStorage.getItem(storageKey);
    const parsed: Product[] = raw ? JSON.parse(raw) : [];
    set({ products: parsed, activeUsername: username });
  },

  addProduct: async (data, username) => {
    const targetUser =
      username !== undefined ? username : get().activeUsername;
    const storageKey = getStorageKey(targetUser);

    // Sincronizar con lo almacenado en AsyncStorage por si aún no se había cargado
    const raw = await AsyncStorage.getItem(storageKey);
    const currentList: Product[] = raw ? JSON.parse(raw) : get().products;

    const newProduct: Product = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name.trim(),
      completed: data.completed ?? false,
      ...(data.imageUri ? { imageUri: data.imageUri } : {}),
      ...(data.location ? { location: data.location } : {}),
      ...(data.supplier ? { supplier: data.supplier } : {}),
      ...(data.calendarReminder
        ? { calendarReminder: data.calendarReminder }
        : {}),
    };

    const updated = [...currentList, newProduct];
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    set({
      products: updated,
      ...(targetUser ? { activeUsername: targetUser } : {}),
    });

    return newProduct;
  },

  updateProduct: async (id, changes, username) => {
    const targetUser =
      username !== undefined ? username : get().activeUsername;
    const storageKey = getStorageKey(targetUser);

    const updated = get().products.map((product) =>
      product.id === id ? { ...product, ...changes } : product
    );

    set({ products: updated });
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  },

  deleteProduct: async (id, username) => {
    const targetUser =
      username !== undefined ? username : get().activeUsername;
    const storageKey = getStorageKey(targetUser);

    const updated = get().products.filter((product) => product.id !== id);
    set({ products: updated });
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  },

  clearProducts: () => {
    set({ products: [], activeUsername: null });
  },
}));

