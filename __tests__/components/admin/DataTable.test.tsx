/**
 * DataTable Component Tests
 *
 * Tests for data table rendering, selection, sorting, and pagination.
 *
 * @module __tests__/components/admin/DataTable.test
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable, { Column } from '@/components/admin/DataTable';

interface TestItem {
  id: string;
  name: string;
  value: number;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Item One', value: 100 },
  { id: '2', name: 'Item Two', value: 200 },
  { id: '3', name: 'Item Three', value: 300 },
];

const mockColumns: Column<TestItem>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'value', header: 'Value', sortable: true, align: 'right' },
];

const keyExtractor = (item: TestItem) => item.id;

describe('DataTable', () => {
  describe('Basic rendering', () => {
    it('should render table with data', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
        />
      );

      expect(screen.getByText('Item One')).toBeInTheDocument();
      expect(screen.getByText('Item Two')).toBeInTheDocument();
      expect(screen.getByText('Item Three')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('should render empty message when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          emptyMessage="No items found"
        />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should use default empty message', () => {
      render(
        <DataTable
          data={[]}
          columns={mockColumns}
          keyExtractor={keyExtractor}
        />
      );

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Custom rendering', () => {
    it('should use custom render function for columns', () => {
      const columnsWithRender: Column<TestItem>[] = [
        { key: 'name', header: 'Name' },
        {
          key: 'value',
          header: 'Value',
          render: (item) => <span data-testid="custom-value">${item.value}</span>,
        },
      ];

      render(
        <DataTable
          data={mockData}
          columns={columnsWithRender}
          keyExtractor={keyExtractor}
        />
      );

      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getAllByTestId('custom-value')).toHaveLength(3);
    });
  });

  describe('Selection', () => {
    it('should render checkboxes when selectable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={true}
          selectedIds={new Set()}
          onSelectionChange={() => {}}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // 1 header checkbox + 3 row checkboxes
      expect(checkboxes).toHaveLength(4);
    });

    it('should not render checkboxes when not selectable', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={false}
        />
      );

      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes).toHaveLength(0);
    });

    it('should show checked state for selected rows', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={true}
          selectedIds={new Set(['1', '2'])}
          onSelectionChange={() => {}}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Row checkboxes (skip header at index 0)
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
    });

    it('should call onSelectionChange when row checkbox is clicked', () => {
      const onSelectionChange = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={true}
          selectedIds={new Set()}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First row checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1']));
    });

    it('should call onSelectionChange with deselected item', () => {
      const onSelectionChange = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={true}
          selectedIds={new Set(['1', '2'])}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Deselect first row

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(['2']));
    });

    it('should select all rows when header checkbox is clicked', () => {
      const onSelectionChange = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={true}
          selectedIds={new Set()}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Header checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1', '2', '3']));
    });

    it('should deselect all rows when header checkbox is clicked and all are selected', () => {
      const onSelectionChange = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          selectable={true}
          selectedIds={new Set(['1', '2', '3'])}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Header checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });
  });

  describe('Sorting', () => {
    it('should call onSort when sortable column header is clicked', () => {
      const onSort = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          onSort={onSort}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('should not call onSort for non-sortable columns', () => {
      const onSort = jest.fn();
      const nonSortableColumns: Column<TestItem>[] = [
        { key: 'name', header: 'Name', sortable: false },
      ];

      render(
        <DataTable
          data={mockData}
          columns={nonSortableColumns}
          keyExtractor={keyExtractor}
          onSort={onSort}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      expect(onSort).not.toHaveBeenCalled();
    });
  });

  describe('Row click', () => {
    it('should call onRowClick when row is clicked', () => {
      const onRowClick = jest.fn();

      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          onRowClick={onRowClick}
        />
      );

      const rows = screen.getAllByRole('row');
      // Skip header row (index 0)
      fireEvent.click(rows[1]);

      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('Pagination', () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      onPageChange: jest.fn(),
      onLimitChange: jest.fn(),
    };

    beforeEach(() => {
      mockPagination.onPageChange.mockClear();
      mockPagination.onLimitChange.mockClear();
    });

    it('should render pagination controls', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      expect(screen.getByText(/Showing 1 to 10 of 25 results/)).toBeInTheDocument();
    });

    it('should not render pagination when totalPages is 1', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={{ ...mockPagination, totalPages: 1 }}
        />
      );

      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });

    it('should call onPageChange when next button is clicked', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      const nextButton = screen.getByTitle('Next page');
      fireEvent.click(nextButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={{ ...mockPagination, page: 2 }}
        />
      );

      const prevButton = screen.getByTitle('Previous page');
      fireEvent.click(prevButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when first page button is clicked', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={{ ...mockPagination, page: 3 }}
        />
      );

      const firstButton = screen.getByTitle('First page');
      fireEvent.click(firstButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when last page button is clicked', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      const lastButton = screen.getByTitle('Last page');
      fireEvent.click(lastButton);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(3);
    });

    it('should disable previous buttons on first page', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      const prevButton = screen.getByTitle('Previous page');
      const firstButton = screen.getByTitle('First page');

      expect(prevButton).toBeDisabled();
      expect(firstButton).toBeDisabled();
    });

    it('should disable next buttons on last page', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={{ ...mockPagination, page: 3 }}
        />
      );

      const nextButton = screen.getByTitle('Next page');
      const lastButton = screen.getByTitle('Last page');

      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });

    it('should call onLimitChange when limit selector changes', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '25' } });

      expect(mockPagination.onLimitChange).toHaveBeenCalledWith(25);
    });

    it('should render page number buttons', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('should call onPageChange when page number is clicked', () => {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          pagination={mockPagination}
        />
      );

      const page2Button = screen.getByRole('button', { name: '2' });
      fireEvent.click(page2Button);

      expect(mockPagination.onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Row className', () => {
    it('should apply custom row className', () => {
      const rowClassName = (item: TestItem) =>
        item.value > 150 ? 'high-value' : 'low-value';

      const { container } = render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={keyExtractor}
          rowClassName={rowClassName}
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveClass('low-value');
      expect(rows[1]).toHaveClass('high-value');
      expect(rows[2]).toHaveClass('high-value');
    });
  });

  describe('Column alignment', () => {
    it('should apply text alignment classes', () => {
      const alignedColumns: Column<TestItem>[] = [
        { key: 'name', header: 'Name', align: 'left' },
        { key: 'value', header: 'Value', align: 'right' },
      ];

      const { container } = render(
        <DataTable
          data={mockData}
          columns={alignedColumns}
          keyExtractor={keyExtractor}
        />
      );

      const cells = container.querySelectorAll('tbody td');
      expect(cells[0]).toHaveClass('text-left');
      expect(cells[1]).toHaveClass('text-right');
    });
  });
});
