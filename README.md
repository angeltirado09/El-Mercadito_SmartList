# 🛒 El Mercadito — Lista de Compras Inteligente

## 📌 Opción Elegida
**Lista de compras inteligente**: Aplicación móvil para gestionar productos de compra con autenticación local, persistencia offline y recordatorios por notificaciones locales.

---

## 🚀 Cómo Ejecutar la App

### Prerrequisitos
- Node.js (v18 o superior)
- Dispositivo móvil con **Expo Go** instalado (Android / iOS) o un emulador configurado

### Pasos de ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar la aplicación con Expo:**
   ```bash
   npx expo start
   ```
   - **En celular físico:** Escanear el código QR desde la app **Expo Go** (Android) o desde la app Cámara (iOS).
   - **En emulador:** Presionar `a` en la terminal para abrir en Android Emulator o `i` para iOS Simulator.

3. **Ejecutar pruebas unitarias (Jest + RNTL):**
   ```bash
   npm test
   ```

---

## ⚙️ Funcionalidades Implementadas

- **Autenticación Local y Sesión:**
  - Registro de usuarios con validación de credenciales (mínimo 3 caracteres para usuario, 6 para contraseña).
  - Inicio de sesión validando contra usuarios almacenados localmente.
  - Persistencia de sesión activa en `AsyncStorage` (mantiene al usuario logueado al reabrir la app).
  - Cierre de sesión seguro con limpieza de credenciales activas.

- **Navegación Protegida (React Navigation):**
  - Implementación de Stack Navigator (`@react-navigation/native-stack`).
  - Rutas condicionadas: usuarios no autenticados solo acceden a *Login* y *Registro*; usuarios autenticados acceden a *Home* y *Alta de Producto*.

- **Gestión de Lista de Compras:**
  - **Alta de productos:** Formulario con validación de nombre no vacío e identificador único temporal.
  - **Visualización:** Lista optimizada con `FlatList` utilizando el componente reutilizable `ProductItem`.
  - **Actualización reactiva:** Uso de `useFocusEffect` para recargar automáticamente la lista al volver de agregar un producto.
  - **Eliminación:** Borrado individual de productos con actualización inmediata en pantalla y en almacenamiento.
  - **Persistencia de datos:** Los productos se guardan en `AsyncStorage` (`@shopping_list`) y persisten al cerrar la aplicación.

- **Notificaciones Locales (Expo SDK 57):**
  - Solicitud de permisos al ingresar a la pantalla principal.
  - Programación automática de una notificación local de recordatorio de compra (`scheduleShoppingReminder`) disparada a los 5 segundos de agregar un nuevo ítem.

- **Componente Reutilizable:**
  - `ProductItem`: Componente modular para cada elemento de la lista con diseño Flexbox, nombre del producto y botón de eliminación por props.

- **Testing Automatizado:**
  - 19 pruebas unitarias y de integración pasando al 100% (`validators.test.ts` y `ProductItem.test.tsx`) cubriendo lógica de negocio pura y renderizado/interacciones con React Native Testing Library.

---

## Enlace Video DEMO de la App en YouTube (No más de 1 min)

- **Link del video:** 

---

## Enlace repositorio en GitHub

- **Link del repo:** 

---