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

  it('muestra la foto, la ubicación del comercio, el proveedor y el recordatorio del calendario cuando están asociados', async () => {
    await render(
      <ProductItem
        id="50"
        name="Yerba Mate"
        imageUri="file:///mock/yerba.jpg"
        location={{
          latitude: -34.6037,
          longitude: -58.3816,
          address: 'Av. Santa Fe 2000',
        }}
        supplier={{
          id: 'sup-1',
          name: 'Distribuidora Misiones',
          phone: '+5491133445566',
        }}
        calendarReminder={{
          eventId: 'cal-1',
          dateISO: '2026-11-11T18:00:00.000Z',
          title: 'Comprar: Yerba Mate',
        }}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByTestId('product-image')).toBeTruthy();
    expect(screen.getByTestId('product-location')).toBeTruthy();
    expect(screen.getByText(/Av\. Santa Fe 2000/)).toBeTruthy();
    expect(screen.getByTestId('product-supplier')).toBeTruthy();
    expect(screen.getByText(/Distribuidora Misiones/)).toBeTruthy();
    expect(screen.getByTestId('product-calendar')).toBeTruthy();
  });
});
