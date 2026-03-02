/**
 * ConfirmDialog Component Tests
 *
 * Tests for confirmation dialog modal.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('displays default button text', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays custom button text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" cancelText="Keep" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const backdrop = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="default" />);
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-[#004D8B]');
    });

    it('renders danger variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />);
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('renders warning variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />);
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-yellow-600');
    });
  });

  describe('loading state', () => {
    it('shows loading state when isLoading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('disables buttons when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Processing...').closest('button')).toBeDisabled();
    });
  });

  it('prevents body scroll when open', () => {
    const { unmount } = render(<ConfirmDialog {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
