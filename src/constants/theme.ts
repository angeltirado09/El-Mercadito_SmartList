/**
 * Paleta de colores de El Mercadito (Lista de Compras Inteligente).
 * Usada como referencia central para estilos consistentes en toda la app.
 */

export const Colors = {
  primary: '#2d6a4f',         // Verde bosque — headers, botones principales
  primaryLight: '#52b788',    // Verde claro — acentos, bordes activos
  primaryContainer: '#d8f3dc',// Verde muy suave — badges, highlights
  background: '#f8f9fa',      // Gris muy claro — fondo general de pantallas
  surface: '#ffffff',         // Blanco — tarjetas, inputs
  text: '#1b2a1f',            // Verde muy oscuro — texto principal
  textSecondary: '#6c757d',   // Gris — texto secundario, placeholders
  danger: '#e63946',          // Rojo — botón eliminar, errores
  dangerContainer: '#ffe8e8', // Rojo muy suave — fondo del botón eliminar
  border: '#ced4da',          // Gris suave — bordes de inputs
  accent: '#b7e4c7',          // Verde menta — texto sobre primary oscuro
} as const;

export type ColorKey = keyof typeof Colors;
