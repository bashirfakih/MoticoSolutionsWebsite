/**
 * FormField Component Tests
 *
 * Tests for form input and select field components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mail } from 'lucide-react';
import FormField, { SelectField } from '@/components/ui/FormField';

describe('FormField', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'testInput',
    label: 'Test Label',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label', () => {
    render(<FormField {...defaultProps} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(<FormField {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    render(<FormField {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', () => {
    const onBlur = jest.fn();
    render(<FormField {...defaultProps} onBlur={onBlur} />);
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders with icon', () => {
    render(<FormField {...defaultProps} icon={Mail} />);
    // Icon should be rendered (SVG)
    const container = screen.getByRole('textbox').parentElement;
    expect(container?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<FormField {...defaultProps} placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<FormField {...defaultProps} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders different input types', () => {
    const { rerender } = render(<FormField {...defaultProps} type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<FormField {...defaultProps} type="password" />);
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('type', 'password');

    rerender(<FormField {...defaultProps} type="tel" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
  });

  it('shows error when touched and has error', () => {
    render(<FormField {...defaultProps} error="This field is required" touched={true} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does not show error when not touched', () => {
    render(<FormField {...defaultProps} error="This field is required" touched={false} />);
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });

  it('shows hint when no error', () => {
    render(<FormField {...defaultProps} hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('hides hint when showing error', () => {
    render(<FormField {...defaultProps} hint="Enter your email address" error="Invalid email" touched={true} />);
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders right element', () => {
    render(<FormField {...defaultProps} rightElement={<span data-testid="right-element">Icon</span>} />);
    expect(screen.getByTestId('right-element')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FormField {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('passes autoComplete attribute', () => {
    render(<FormField {...defaultProps} autoComplete="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
  });
});

describe('SelectField', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    id: 'test-select',
    name: 'testSelect',
    label: 'Test Select',
    value: '',
    onChange: jest.fn(),
    options,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label', () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<SelectField {...defaultProps} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    render(<SelectField {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('calls onBlur when select loses focus', () => {
    const onBlur = jest.fn();
    render(<SelectField {...defaultProps} onBlur={onBlur} />);
    const select = screen.getByRole('combobox');
    fireEvent.blur(select);
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders required indicator', () => {
    render(<SelectField {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<SelectField {...defaultProps} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('shows error when touched and has error', () => {
    render(<SelectField {...defaultProps} error="Selection required" touched={true} />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('does not show error when not touched', () => {
    render(<SelectField {...defaultProps} error="Selection required" touched={false} />);
    expect(screen.queryByText('Selection required')).not.toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<SelectField {...defaultProps} icon={Mail} />);
    const container = screen.getByRole('combobox').parentElement;
    expect(container?.querySelector('svg')).toBeInTheDocument();
  });
});
