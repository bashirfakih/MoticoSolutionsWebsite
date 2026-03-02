/**
 * LoadingSpinner Component Tests
 *
 * Tests for loading spinner variants.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner, { PageLoader, SectionLoader } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  describe('size variants', () => {
    it('renders small size', () => {
      render(<LoadingSpinner size="sm" />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders medium size (default)', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('renders large size', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('renders extra large size', () => {
      render(<LoadingSpinner size="xl" />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('color variants', () => {
    it('renders primary color (default)', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('text-[#004D8B]');
    });

    it('renders white color', () => {
      render(<LoadingSpinner color="white" />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('text-white');
    });

    it('renders gray color', () => {
      render(<LoadingSpinner color="gray" />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toHaveClass('text-gray-400');
    });
  });

  it('accepts custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('PageLoader', () => {
  it('renders with default message', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<PageLoader message="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('renders extra large spinner', () => {
    render(<PageLoader />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });
});

describe('SectionLoader', () => {
  it('renders with default height', () => {
    const { container } = render(<SectionLoader />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('h-64');
  });

  it('renders with custom height', () => {
    const { container } = render(<SectionLoader height="h-32" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('h-32');
  });

  it('renders large spinner', () => {
    render(<SectionLoader />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });
});
