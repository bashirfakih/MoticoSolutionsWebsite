/**
 * Toast Component Tests
 *
 * Tests for toast notification system.
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/Toast';

// Test component that uses the toast hook
function ToastTestComponent() {
  const { success, error, warning, info, toasts, removeToast } = useToast();

  return (
    <div>
      <button onClick={() => success('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => error('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => warning('Warning!', 'Please be careful')}>
        Show Warning
      </button>
      <button onClick={() => info('Info', 'Here is some information')}>
        Show Info
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>Remove First</button>
      )}
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('provides toast context', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );
    expect(screen.getByText('Show Success')).toBeInTheDocument();
  });
});

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('throws error when used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<ToastTestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    console.error = consoleError;
  });

  it('adds success toast', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('adds error toast', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Error'));
    });

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('adds warning toast', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Warning'));
    });

    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Please be careful')).toBeInTheDocument();
  });

  it('adds info toast', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Info'));
    });

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Here is some information')).toBeInTheDocument();
  });

  it('removes toast', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });

    expect(screen.getByText('Success!')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('Remove First'));
    });

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('auto-removes toast after duration', async () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });

    expect(screen.getByText('Success!')).toBeInTheDocument();

    // Fast-forward timer
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });
  });

  it('can have multiple toasts', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
    });

    expect(screen.getByTestId('toast-count').textContent).toBe('2');
  });

  it('removes toast when close button clicked', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });

    const closeButton = screen.getByLabelText('Close notification');
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });
});

describe('Toast styling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('success toast has correct styling', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('error toast has correct styling', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Error'));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('warning toast has correct styling', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Warning'));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('info toast has correct styling', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Info'));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
  });
});
