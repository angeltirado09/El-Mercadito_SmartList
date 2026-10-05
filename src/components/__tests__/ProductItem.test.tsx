import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ProductItem from '../ProductItem';

// ============================================================
// Test Suite 3: ProductItem (componente reutilizable)
// RNTL v14: render es async y se usan screen.getByText / screen.getByTestId
// ============================================================
describe('ProductItem', () => {
  afterEach(() => jest.clearAllMocks());

  it('muestra el nombre del producto en pantalla', async () => {
    await render(
      <ProductItem id="1" name="Leche descremada" onDelete={jest.fn()} />,
    );
    expect(screen.getByText('Leche descremada')).toBeTruthy();
  });

  it('llama a onDelete con el id correcto al presionar el botón eliminar', async () => {
    const onDelete = jest.fn();
    await render(
      <ProductItem id="1" name="Leche descremada" onDelete={onDelete} />,
    );
    fireEvent.press(screen.getByTestId('delete-btn'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('no llama a onDelete si el botón no fue presionado', async () => {
    const onDelete = jest.fn();
    await render(<ProductItem id="1" name="Leche descremada" onDelete={onDelete} />);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('muestra correctamente el nombre de cualquier producto', async () => {
    await render(
      <ProductItem id="99" name="Pan integral de centeno" onDelete={jest.fn()} />,
    );
    expect(screen.getByText('Pan integral de centeno')).toBeTruthy();
  });

  it('llama a onDelete con el id "99" al presionar eliminar', async () => {
    const onDelete = jest.fn();
    await render(
      <ProductItem id="99" name="Pan integral" onDelete={onDelete} />,
    );
    fireEvent.press(screen.getByTestId('delete-btn'));
    expect(onDelete).toHaveBeenCalledWith('99');
  });
});
