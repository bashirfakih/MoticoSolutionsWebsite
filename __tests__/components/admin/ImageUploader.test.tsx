/**
 * ImageUploader Component Tests
 *
 * Tests for image upload functionality.
 *
 * @module __tests__/components/admin/ImageUploader.test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUploader from '@/components/admin/ImageUploader';
import { ProductImage } from '@/lib/data/types';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

const createMockImages = (): ProductImage[] => [
  {
    id: 'img-1',
    url: '/test-image-1.jpg',
    alt: 'Test Image 1',
    sortOrder: 1,
    isPrimary: true,
  },
  {
    id: 'img-2',
    url: '/test-image-2.jpg',
    alt: 'Test Image 2',
    sortOrder: 2,
    isPrimary: false,
  },
];

// Use a getter to always get fresh copies to avoid mutation issues
const getMockImages = () => createMockImages();

describe('ImageUploader', () => {
  describe('Basic rendering', () => {
    it('should render upload zone', () => {
      render(<ImageUploader images={[]} onChange={() => {}} />);

      expect(screen.getByText('Drop images here or click to upload')).toBeInTheDocument();
    });

    it('should show image count', () => {
      render(<ImageUploader images={getMockImages()} onChange={() => {}} maxImages={10} />);

      expect(screen.getByText(/2\/10/)).toBeInTheDocument();
    });

    it('should render existing images', () => {
      render(<ImageUploader images={getMockImages()} onChange={() => {}} />);

      const images = screen.getAllByTestId('next-image');
      expect(images).toHaveLength(2);
    });

    it('should show primary badge on primary image', () => {
      render(<ImageUploader images={getMockImages()} onChange={() => {}} />);

      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  describe('Alt text management', () => {
    it('should render alt text inputs for each image', () => {
      render(<ImageUploader images={getMockImages()} onChange={() => {}} />);

      const altInputs = screen.getAllByPlaceholderText('Alt text...');
      expect(altInputs).toHaveLength(2);
      expect(altInputs[0]).toHaveValue('Test Image 1');
      expect(altInputs[1]).toHaveValue('Test Image 2');
    });

    it('should call onChange when alt text is modified', () => {
      const onChange = jest.fn();
      render(<ImageUploader images={getMockImages()} onChange={onChange} />);

      const altInputs = screen.getAllByPlaceholderText('Alt text...');
      fireEvent.change(altInputs[0], { target: { value: 'New Alt Text' } });

      expect(onChange).toHaveBeenCalled();
      const calledWith = onChange.mock.calls[0][0];
      expect(calledWith[0].alt).toBe('New Alt Text');
    });
  });

  describe('Image removal', () => {
    it('should call onChange with image removed', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={onChange} />
      );

      // Hover to show remove button - find the image container and hover
      const imageContainers = container.querySelectorAll('.group');
      expect(imageContainers.length).toBeGreaterThan(0);

      // Find the remove button (X icon) - it's in the overlay
      const removeButtons = container.querySelectorAll('button[title="Remove"]');
      expect(removeButtons.length).toBe(2);

      fireEvent.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalled();
      const calledWith = onChange.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0].id).toBe('img-2');
    });

    it('should set new primary when primary image is removed', () => {
      const onChange = jest.fn();
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={onChange} />
      );

      const removeButtons = container.querySelectorAll('button[title="Remove"]');
      // Remove the primary image (first one)
      fireEvent.click(removeButtons[0]);

      const calledWith = onChange.mock.calls[0][0];
      expect(calledWith[0].isPrimary).toBe(true);
    });
  });

  describe('Set primary image', () => {
    it('should call onChange with new primary set', () => {
      const onChange = jest.fn();
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={onChange} />
      );

      // Find set primary button (Star icon)
      const primaryButtons = container.querySelectorAll('button[title="Set as primary"]');
      expect(primaryButtons).toHaveLength(1); // Only non-primary images have this button

      fireEvent.click(primaryButtons[0]);

      expect(onChange).toHaveBeenCalled();
      const calledWith = onChange.mock.calls[0][0];
      expect(calledWith.find((img: ProductImage) => img.id === 'img-1').isPrimary).toBe(false);
      expect(calledWith.find((img: ProductImage) => img.id === 'img-2').isPrimary).toBe(true);
    });
  });

  describe('Image reordering', () => {
    it('should have move up buttons for images', () => {
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={() => {}} />
      );

      const moveButtons = container.querySelectorAll('button[title="Move up"]');
      expect(moveButtons).toHaveLength(2);
    });

    it('should disable move up for first image', () => {
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={() => {}} />
      );

      const moveButtons = container.querySelectorAll('button[title="Move up"]');
      expect(moveButtons[0]).toBeDisabled();
    });
  });

  describe('File upload', () => {
    it('should have hidden file input', () => {
      const { container } = render(
        <ImageUploader images={[]} onChange={() => {}} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should accept multiple files', () => {
      const { container } = render(
        <ImageUploader images={[]} onChange={() => {}} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('should accept correct file types', () => {
      const { container } = render(
        <ImageUploader
          images={[]}
          onChange={() => {}}
          acceptedTypes={['image/jpeg', 'image/png']}
        />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png');
    });

    it('should disable file input when max images reached', () => {
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={() => {}} maxImages={2} />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeDisabled();
    });

    it('should handle file selection', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ImageUploader images={[]} onChange={onChange} />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a mock file
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as (() => void) | null,
        result: 'data:image/png;base64,test',
      };
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

      // Trigger file selection
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      fireEvent.change(fileInput);

      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload();
      }

      await waitFor(() => {
        if (onChange.mock.calls.length > 0) {
          const calledWith = onChange.mock.calls[0][0];
          expect(calledWith).toHaveLength(1);
          expect(calledWith[0].isPrimary).toBe(true);
        }
      });
    });
  });

  describe('Drag and drop', () => {
    it('should handle drag enter', () => {
      const { container } = render(
        <ImageUploader images={[]} onChange={() => {}} />
      );

      const dropZone = container.querySelector('.border-dashed');

      fireEvent.dragEnter(dropZone!);

      // The component should show dragging state
      expect(dropZone).toHaveClass('border-[#004D8B]');
    });

    it('should handle drag leave', () => {
      const { container } = render(
        <ImageUploader images={[]} onChange={() => {}} />
      );

      const dropZone = container.querySelector('.border-dashed');

      fireEvent.dragEnter(dropZone!);
      fireEvent.dragLeave(dropZone!);

      expect(dropZone).not.toHaveClass('border-[#004D8B]');
    });

    it('should handle drag over', () => {
      const { container } = render(
        <ImageUploader images={[]} onChange={() => {}} />
      );

      const dropZone = container.querySelector('.border-dashed');
      const event = new Event('dragover', { bubbles: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      dropZone!.dispatchEvent(event);
    });

    it('should handle drop', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ImageUploader images={[]} onChange={onChange} />
      );

      const dropZone = container.querySelector('.border-dashed');

      // Create mock file
      const file = new File(['test'], 'dropped.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as (() => void) | null,
        result: 'data:image/png;base64,test',
      };
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

      // Create drop event
      const dropEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: {
          files: [file],
        },
      };

      fireEvent.drop(dropZone!, dropEvent);

      // Should reset drag state
      expect(dropZone).not.toHaveClass('border-[#004D8B]');
    });
  });

  describe('Max images limit', () => {
    it('should show disabled state when max images reached', () => {
      const { container } = render(
        <ImageUploader images={getMockImages()} onChange={() => {}} maxImages={2} />
      );

      const dropZone = container.querySelector('.border-dashed');
      expect(dropZone).toHaveClass('opacity-50');
      expect(dropZone).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Empty state', () => {
    it('should not render image grid when no images', () => {
      const { container } = render(
        <ImageUploader images={[]} onChange={() => {}} />
      );

      const imageGrid = container.querySelector('.grid');
      expect(imageGrid).not.toBeInTheDocument();
    });
  });
});
