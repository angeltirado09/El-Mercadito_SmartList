/**
 * Paleta de colores de El Mercadito (Lista de Compras Inteligente).
 *
 * Modo Claro (implementado originalmente en HomeScreen.tsx):
 *   - Fondo general: #fcf1d5 (crema cálido)
 *   - Primario / Headers / Banner de bienvenida: #6d0d18 (borgoña oscuro)
 *   - Texto sobre cabeceras: #fcf1d5 (crema)
 *   - Superficies / Tarjetas: #ffffff
 *   - Acentos: #6d0d18
 *
 * Modo Oscuro (exactamente la MISMA paleta, con los colores invertidos):
 *   - Fondo general: #6d0d18 (borgoña oscuro)
 *   - Primario / Botones: #fcf1d5 (crema)
 *   - Headers / Banner de bienvenida: #fcf1d5 (crema, invertido!)
 *   - Texto sobre cabeceras: #6d0d18 (borgoña, invertido!)
 *   - Superficies / Tarjetas: #540912 (borgoña profundo)
 *   - Acentos: #fcf1d5
 */

export const LightTheme = {
  mode: 'light' as const,
  // Fondos y superficies
  background: '#fcf1d5',
  surface: '#ffffff',
  surfaceSubtle: '#fffdf7',
  card: '#ffffff',
  cardBorder: '#ebd9ba',

  // Cabeceras y banner de bienvenida (Modo Claro)
  headerBackground: '#5d0a14',
  headerCardBackground: '#6d0d18',
  headerText: '#fcf1d5',
  headerGreetingText: '#fcf1d5',
  headerButtonBackground: '#6d0d18',
  headerButtonBorder: '#fcf1d5',
  headerButtonText: '#fcf1d5',

  // Textos
  text: '#6d0d18',
  textSecondary: '#8e3a44',
  textMuted: 'rgba(109, 13, 24, 0.7)',

  // Bordes y separadores
  border: '#ebd9ba',
  borderLight: '#f1e7cd',

  // Botones primarios
  buttonPrimary: '#6d0d18',
  buttonPrimaryText: '#fcf1d5',

  // Botones secundarios y acciones
  buttonSecondary: 'transparent',
  buttonSecondaryText: '#6d0d18',

  // Campos de texto (inputs)
  inputBackground: '#ffffff',
  inputBorder: '#ebd9ba',
  inputText: '#6d0d18',
  inputPlaceholder: '#a87980',

  // Acentos y badges
  accent: '#6d0d18',
  badgeBackground: '#faeed2',
  badgeText: '#6d0d18',

  // Estados de peligro / errores / eliminación
  danger: '#b02a37',
  dangerContainer: '#fce4e6',
  dangerText: '#b02a37',

  // Sombras
  shadowColor: '#6d0d18',
};

export const DarkTheme = {
  mode: 'dark' as const,
  // Fondos y superficies invertidos
  background: '#6d0d18',
  surface: '#540912',
  surfaceSubtle: '#42070e',
  card: '#540912',
  cardBorder: '#7d1522',

  // Cabeceras y banner de bienvenida (INVERTIDOS a crema en Modo Oscuro)
  headerBackground: '#fcf1d5',
  headerCardBackground: '#fcf1d5',
  headerText: '#6d0d18',
  headerGreetingText: '#6d0d18',
  headerButtonBackground: '#6d0d18',
  headerButtonBorder: '#6d0d18',
  headerButtonText: '#fcf1d5',

  // Textos
  text: '#fcf1d5',
  textSecondary: '#ebd9ba',
  textMuted: 'rgba(252, 241, 213, 0.7)',

  // Bordes y separadores
  border: '#8a1d28',
  borderLight: '#781520',

  // Botones primarios invertidos
  buttonPrimary: '#fcf1d5',
  buttonPrimaryText: '#6d0d18',

  // Botones secundarios y acciones
  buttonSecondary: 'transparent',
  buttonSecondaryText: '#fcf1d5',

  // Campos de texto (inputs) invertidos
  inputBackground: '#42070e',
  inputBorder: '#8a1d28',
  inputText: '#fcf1d5',
  inputPlaceholder: '#d0bba0',

  // Acentos y badges
  accent: '#fcf1d5',
  badgeBackground: '#42070e',
  badgeText: '#fcf1d5',

  // Estados de peligro / errores / eliminación
  danger: '#ff8a93',
  dangerContainer: '#6e1822',
  dangerText: '#ff8a93',

  // Sombras
  shadowColor: '#000000',
};

export type ThemeMode = 'light' | 'dark';
export type Theme = Omit<typeof LightTheme, 'mode'> & { mode: ThemeMode };

// Compatibilidad hacia atrás
export const Colors = LightTheme;
export type ColorKey = keyof typeof LightTheme;
