import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ThemeToggleButton from '../ThemeToggleButton';
import { ThemeProvider } from '../../context/ThemeContext';
import { LightTheme, DarkTheme } from '../../constants/theme';

describe('ThemeToggleButton con íconos vectoriales armónicos', () => {
  afterEach(() => jest.clearAllMocks());

  it('muestra el ícono vectorial de la luna en modo claro por defecto', async () => {
    await render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeTruthy();
    expect(screen.queryByTestId('sun-icon')).toBeNull();
    expect(screen.getByTestId('theme-toggle-btn')).toBeTruthy();
  });

  it('cambia a ícono vectorial de sol al alternar a modo oscuro', async () => {
    await render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle-btn');
    fireEvent.press(button);

    await waitFor(() => {
      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toBeTruthy();
      expect(screen.queryByTestId('moon-icon')).toBeNull();
    });
  });

  it('vuelve al ícono de luna al presionar dos veces', async () => {
    await render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle-btn');
    fireEvent.press(button);

    await waitFor(() => {
      expect(screen.getByTestId('sun-icon')).toBeTruthy();
    });

    fireEvent.press(button);

    await waitFor(() => {
      expect(screen.getByTestId('moon-icon')).toBeTruthy();
    });
  });

  it('la paleta de modo claro coincide con los colores de HomeScreen', () => {
    expect(LightTheme.background).toBe('#fcf1d5');
    expect(LightTheme.headerBackground).toBe('#5d0a14');
    expect(LightTheme.headerCardBackground).toBe('#6d0d18');
    expect(LightTheme.headerText).toBe('#fcf1d5');
    expect(LightTheme.buttonPrimary).toBe('#6d0d18');
    expect(LightTheme.buttonPrimaryText).toBe('#fcf1d5');
    expect(LightTheme.text).toBe('#6d0d18');
  });

  it('la paleta de modo oscuro tiene los colores invertidos de modo claro (incluyendo header y banner)', () => {
    expect(DarkTheme.background).toBe('#6d0d18');
    expect(DarkTheme.headerBackground).toBe('#fcf1d5');
    expect(DarkTheme.headerCardBackground).toBe('#fcf1d5');
    expect(DarkTheme.headerText).toBe('#6d0d18');
    expect(DarkTheme.buttonPrimary).toBe('#fcf1d5');
    expect(DarkTheme.buttonPrimaryText).toBe('#6d0d18');
    expect(DarkTheme.text).toBe('#fcf1d5');
  });
});
