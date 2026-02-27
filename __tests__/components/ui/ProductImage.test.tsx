/**
 * ProductImage Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductImage from '@/components/ui/ProductImage';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onError, onLoad, ...props }: {
    src: string;
    alt: string;
    onError?: () => void;
    onLoad?: () => void;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={onError}
      onLoad={onLoad}
      data-testid="next-image"
      {...props}
    />
  ),
}));

describe('ProductImage', () => {
  it('renders image when src is provided', () => {
    render(
      <ProductImage src="/products/test.jpg" alt="Test Product" />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/products/test.jpg');
    expect(image).toHaveAttribute('alt', 'Test Product');
  });

  it('renders fallback when src is empty', () => {
    render(
      <ProductImage src="" alt="Test Product" />
    );

    // Should not render image, should render fallback
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });

  it('shows fallback on image error', () => {
    const { container } = render(
      <ProductImage src="/invalid/path.jpg" alt="Test Product" />
    );

    const image = screen.getByTestId('next-image');

    // Simulate image error
    fireEvent.error(image);

    // After error, image should be replaced with fallback
    // The component should re-render with fallback state
    expect(container.querySelector('svg')).toBeInTheDocument(); // Package icon
  });

  it('applies custom className', () => {
    render(
      <ProductImage
        src="/products/test.jpg"
        alt="Test Product"
        className="custom-class"
      />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toHaveClass('custom-class');
  });

  it('uses default width and height', () => {
    render(
      <ProductImage src="/products/test.jpg" alt="Test Product" />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('width', '40');
    expect(image).toHaveAttribute('height', '40');
  });

  it('uses custom width and height', () => {
    render(
      <ProductImage
        src="/products/test.jpg"
        alt="Test Product"
        width={100}
        height={100}
      />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('width', '100');
    expect(image).toHaveAttribute('height', '100');
  });
});
