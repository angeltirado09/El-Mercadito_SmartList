import { validateAuthInput, validateProductName } from './validators';

// ============================================================
// Test Suite 1: validateAuthInput
// ============================================================
describe('validateAuthInput', () => {
  afterEach(() => jest.clearAllMocks());

  it('rechaza usuario con menos de 3 caracteres', () => {
    expect(validateAuthInput('ab', 'password123')).toBe(false);
  });

  it('rechaza usuario vacío', () => {
    expect(validateAuthInput('', 'password123')).toBe(false);
  });

  it('rechaza usuario de solo espacios', () => {
    expect(validateAuthInput('   ', 'password123')).toBe(false);
  });

  it('rechaza contraseña con menos de 6 caracteres', () => {
    expect(validateAuthInput('usuario', '123')).toBe(false);
  });

  it('rechaza contraseña vacía', () => {
    expect(validateAuthInput('usuario', '')).toBe(false);
  });

  it('acepta credenciales válidas', () => {
    expect(validateAuthInput('usuario', 'password123')).toBe(true);
  });

  it('acepta usuario con exactamente 3 caracteres', () => {
    expect(validateAuthInput('abc', 'mipassword')).toBe(true);
  });

  it('acepta contraseña con exactamente 6 caracteres', () => {
    expect(validateAuthInput('usuario', '123456')).toBe(true);
  });
});

// ============================================================
// Test Suite 2: validateProductName
// ============================================================
describe('validateProductName', () => {
  afterEach(() => jest.clearAllMocks());

  it('rechaza string vacío', () => {
    expect(validateProductName('')).toBe(false);
  });

  it('rechaza string de solo espacios en blanco', () => {
    expect(validateProductName('   ')).toBe(false);
  });

  it('rechaza string de solo tabulaciones', () => {
    expect(validateProductName('\t\t')).toBe(false);
  });

  it('acepta nombre de producto válido', () => {
    expect(validateProductName('Leche descremada')).toBe(true);
  });

  it('acepta nombre con un solo caracter', () => {
    expect(validateProductName('A')).toBe(true);
  });

  it('acepta nombre con espacios alrededor pero contenido válido', () => {
    expect(validateProductName('  Pan integral  ')).toBe(true);
  });
});
