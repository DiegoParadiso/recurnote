import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders correctly with default props', () => {
    render(<LoadingSpinner />);
    // Usamos queryByText para evitar errores si no está, y verificamos que exista
    expect(screen.queryByText('Cargando...')).not.toBeNull();
  });

  it('renders custom text', () => {
    render(<LoadingSpinner text="Espere por favor" />);
    expect(screen.queryByText('Espere por favor')).not.toBeNull();
  });

  it('hides text when showText is false', () => {
    render(<LoadingSpinner text="Cargando..." showText={false} />);
    expect(screen.queryByText('Cargando...')).toBeNull();
  });
});
