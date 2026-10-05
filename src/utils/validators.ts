/**
 * Funciones puras de validación para autenticación y productos.
 * Sin efectos secundarios — fácilmente testeables con Jest.
 */

/**
 * Valida que el nombre de usuario tenga al menos 3 caracteres
 * y que la contraseña tenga al menos 6 caracteres.
 */
export function validateAuthInput(username: string, password: string): boolean {
  return username.trim().length >= 3 && password.length >= 6;
}

/**
 * Valida que el nombre del producto no esté vacío ni sea solo espacios en blanco.
 */
export function validateProductName(name: string): boolean {
  return name.trim().length > 0;
}
