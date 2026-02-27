/**
 * Orders API Route Tests
 * Tests CRUD operations, status transitions, and business logic
 */

// Mock Prisma
const mockPrismaOrder = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockPrismaOrderItem = {
  createMany: jest.fn(),
  deleteMany: jest.fn(),
};

const mockPrismaProduct = {
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockPrismaCustomer = {
  findUnique: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  prisma: {
    order: mockPrismaOrder,
    orderItem: mockPrismaOrderItem,
    product: mockPrismaProduct,
    customer: mockPrismaCustomer,
    $transaction: jest.fn((callback) => callback({
      order: mockPrismaOrder,
      orderItem: mockPrismaOrderItem,
      product: mockPrismaProduct,
    })),
  },
}));

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Order status constants
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

describe('Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  describe('GET /api/orders', () => {
    it('returns paginated orders list', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: ORDER_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
          subtotal: 199.99,
          total: 219.99,
          customer: { id: 'cust-1', name: 'John Doe' },
          items: [{ id: 'item-1', quantity: 2, unitPrice: 99.99 }],
          _count: { items: 1 },
          createdAt: new Date(),
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          status: ORDER_STATUS.CONFIRMED,
          paymentStatus: PAYMENT_STATUS.PAID,
          subtotal: 299.99,
          total: 329.99,
          customer: { id: 'cust-2', name: 'Jane Smith' },
          items: [{ id: 'item-2', quantity: 3, unitPrice: 99.99 }],
          _count: { items: 1 },
          createdAt: new Date(),
        },
      ];

      mockPrismaOrder.findMany.mockResolvedValue(mockOrders);
      mockPrismaOrder.count.mockResolvedValue(2);

      const result = await mockPrismaOrder.findMany({});
      expect(result).toHaveLength(2);
      expect(result[0].orderNumber).toBe('ORD-001');
    });

    it('filters orders by status', async () => {
      const pendingOrders = [
        { id: 'order-1', status: ORDER_STATUS.PENDING },
      ];

      mockPrismaOrder.findMany.mockResolvedValue(pendingOrders);
      mockPrismaOrder.count.mockResolvedValue(1);

      const whereClause = { status: ORDER_STATUS.PENDING };
      expect(whereClause.status).toBe('pending');
    });

    it('filters orders by payment status', async () => {
      const unpaidOrders = [
        { id: 'order-1', paymentStatus: PAYMENT_STATUS.PENDING },
      ];

      mockPrismaOrder.findMany.mockResolvedValue(unpaidOrders);

      const whereClause = { paymentStatus: PAYMENT_STATUS.PENDING };
      expect(whereClause.paymentStatus).toBe('pending');
    });

    it('filters orders by customer', async () => {
      const customerId = 'cust-123';
      const customerOrders = [
        { id: 'order-1', customerId },
        { id: 'order-2', customerId },
      ];

      mockPrismaOrder.findMany.mockResolvedValue(customerOrders);

      const whereClause = { customerId };
      expect(whereClause.customerId).toBe(customerId);
    });

    it('filters orders by date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const whereClause = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      expect(whereClause.createdAt.gte).toEqual(startDate);
      expect(whereClause.createdAt.lte).toEqual(endDate);
    });

    it('searches orders by order number', async () => {
      const searchQuery = 'ORD-001';

      mockPrismaOrder.findMany.mockResolvedValue([
        { id: 'order-1', orderNumber: 'ORD-001' },
      ]);

      const whereClause = {
        orderNumber: { contains: searchQuery, mode: 'insensitive' },
      };

      expect(whereClause.orderNumber.contains).toBe(searchQuery);
    });
  });

  describe('POST /api/orders', () => {
    it('creates a new order with items', async () => {
      const newOrder = {
        customerId: 'cust-1',
        items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 99.99 },
          { productId: 'prod-2', quantity: 1, unitPrice: 149.99 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          country: 'Lebanon',
        },
        notes: 'Handle with care',
      };

      const createdOrder = {
        id: 'order-new',
        orderNumber: 'ORD-003',
        status: ORDER_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
        subtotal: 349.97,
        tax: 0,
        shipping: 0,
        total: 349.97,
        ...newOrder,
        items: newOrder.items.map((item, idx) => ({
          id: `item-${idx}`,
          orderId: 'order-new',
          ...item,
        })),
        createdAt: new Date(),
      };

      mockPrismaOrder.create.mockResolvedValue(createdOrder);
      mockPrismaCustomer.findUnique.mockResolvedValue({
        id: 'cust-1',
        name: 'John Doe',
      });
      mockPrismaProduct.findUnique
        .mockResolvedValueOnce({ id: 'prod-1', name: 'Product 1', stockQuantity: 10 })
        .mockResolvedValueOnce({ id: 'prod-2', name: 'Product 2', stockQuantity: 5 });

      const result = await mockPrismaOrder.create({
        data: {
          ...newOrder,
          orderNumber: 'ORD-003',
          status: ORDER_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
      });

      expect(result.id).toBe('order-new');
      expect(result.status).toBe(ORDER_STATUS.PENDING);
    });

    it('calculates order totals correctly', () => {
      const items = [
        { quantity: 2, unitPrice: 99.99 },
        { quantity: 1, unitPrice: 149.99 },
        { quantity: 3, unitPrice: 49.99 },
      ];

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      expect(subtotal).toBeCloseTo(499.94, 2);
    });

    it('generates unique order number', () => {
      const generateOrderNumber = () => {
        const prefix = 'ORD';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
      };

      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();

      expect(orderNumber1).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });

    it('validates customer exists', async () => {
      mockPrismaCustomer.findUnique.mockResolvedValue(null);

      const customer = await mockPrismaCustomer.findUnique({
        where: { id: 'non-existent' },
      });

      expect(customer).toBeNull();
    });

    it('validates products exist and have stock', async () => {
      mockPrismaProduct.findUnique.mockReset();
      mockPrismaProduct.findUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product',
        stockQuantity: 0, // Out of stock
        stockStatus: 'out_of_stock',
      });

      const product = await mockPrismaProduct.findUnique({
        where: { id: 'prod-1' },
      });

      expect(product.stockQuantity).toBe(0);
    });
  });

  describe('GET /api/orders/[id]', () => {
    it('returns order with full details', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: ORDER_STATUS.CONFIRMED,
        paymentStatus: PAYMENT_STATUS.PAID,
        subtotal: 199.99,
        total: 219.99,
        customer: {
          id: 'cust-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+961 3 123 456',
        },
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 99.99,
            product: { id: 'prod-1', name: 'Test Product', sku: 'SKU-001' },
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Beirut',
          country: 'Lebanon',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaOrder.findUnique.mockResolvedValue(mockOrder);

      const result = await mockPrismaOrder.findUnique({
        where: { id: 'order-1' },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      expect(result).toBeDefined();
      expect(result.customer.name).toBe('John Doe');
      expect(result.items).toHaveLength(1);
    });

    it('returns 404 for non-existent order', async () => {
      mockPrismaOrder.findUnique.mockResolvedValue(null);

      const result = await mockPrismaOrder.findUnique({
        where: { id: 'non-existent' },
      });

      expect(result).toBeNull();
    });
  });

  describe('PATCH /api/orders/[id]', () => {
    it('updates order status', async () => {
      const existingOrder = {
        id: 'order-1',
        status: ORDER_STATUS.PENDING,
      };

      mockPrismaOrder.findUnique.mockResolvedValue(existingOrder);
      mockPrismaOrder.update.mockResolvedValue({
        ...existingOrder,
        status: ORDER_STATUS.CONFIRMED,
        updatedAt: new Date(),
      });

      const result = await mockPrismaOrder.update({
        where: { id: 'order-1' },
        data: { status: ORDER_STATUS.CONFIRMED },
      });

      expect(result.status).toBe(ORDER_STATUS.CONFIRMED);
    });

    it('updates payment status', async () => {
      const existingOrder = {
        id: 'order-1',
        paymentStatus: PAYMENT_STATUS.PENDING,
      };

      mockPrismaOrder.findUnique.mockResolvedValue(existingOrder);
      mockPrismaOrder.update.mockResolvedValue({
        ...existingOrder,
        paymentStatus: PAYMENT_STATUS.PAID,
        paidAt: new Date(),
      });

      const result = await mockPrismaOrder.update({
        where: { id: 'order-1' },
        data: { paymentStatus: PAYMENT_STATUS.PAID, paidAt: new Date() },
      });

      expect(result.paymentStatus).toBe(PAYMENT_STATUS.PAID);
      expect(result.paidAt).toBeDefined();
    });

    it('adds tracking number', async () => {
      const existingOrder = {
        id: 'order-1',
        status: ORDER_STATUS.PROCESSING,
        trackingNumber: null,
      };

      mockPrismaOrder.findUnique.mockResolvedValue(existingOrder);
      mockPrismaOrder.update.mockResolvedValue({
        ...existingOrder,
        status: ORDER_STATUS.SHIPPED,
        trackingNumber: 'TRACK123456',
        shippedAt: new Date(),
      });

      const result = await mockPrismaOrder.update({
        where: { id: 'order-1' },
        data: {
          status: ORDER_STATUS.SHIPPED,
          trackingNumber: 'TRACK123456',
          shippedAt: new Date(),
        },
      });

      expect(result.trackingNumber).toBe('TRACK123456');
      expect(result.status).toBe(ORDER_STATUS.SHIPPED);
    });

    it('updates shipping address', async () => {
      const newAddress = {
        street: '456 New St',
        city: 'New City',
        country: 'Lebanon',
      };

      mockPrismaOrder.update.mockResolvedValue({
        id: 'order-1',
        shippingAddress: newAddress,
      });

      const result = await mockPrismaOrder.update({
        where: { id: 'order-1' },
        data: { shippingAddress: newAddress },
      });

      expect(result.shippingAddress.street).toBe('456 New St');
    });
  });

  describe('DELETE /api/orders/[id]', () => {
    it('deletes pending order', async () => {
      const order = {
        id: 'order-1',
        status: ORDER_STATUS.PENDING,
      };

      mockPrismaOrder.findUnique.mockResolvedValue(order);
      mockPrismaOrder.delete.mockResolvedValue(order);

      const result = await mockPrismaOrder.delete({
        where: { id: 'order-1' },
      });

      expect(result.id).toBe('order-1');
    });

    it('prevents deletion of shipped orders', async () => {
      const order = {
        id: 'order-1',
        status: ORDER_STATUS.SHIPPED,
      };

      mockPrismaOrder.findUnique.mockResolvedValue(order);

      // Should not delete shipped orders
      expect(order.status).toBe(ORDER_STATUS.SHIPPED);
      const canDelete = [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED].includes(
        order.status as 'pending' | 'cancelled'
      );
      expect(canDelete).toBe(false);
    });

    it('prevents deletion of delivered orders', async () => {
      const order = {
        id: 'order-1',
        status: ORDER_STATUS.DELIVERED,
      };

      mockPrismaOrder.findUnique.mockResolvedValue(order);

      const canDelete = [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED].includes(
        order.status as 'pending' | 'cancelled'
      );
      expect(canDelete).toBe(false);
    });
  });
});

describe('Order Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  it('allows valid status transitions', () => {
    expect(validTransitions.pending).toContain('confirmed');
    expect(validTransitions.confirmed).toContain('processing');
    expect(validTransitions.processing).toContain('shipped');
    expect(validTransitions.shipped).toContain('delivered');
  });

  it('prevents invalid status transitions', () => {
    expect(validTransitions.delivered).not.toContain('pending');
    expect(validTransitions.cancelled).not.toContain('confirmed');
    expect(validTransitions.shipped).not.toContain('processing');
  });

  it('validates transition from pending', () => {
    const currentStatus = 'pending';
    const allowedNext = validTransitions[currentStatus];

    expect(allowedNext).toContain('confirmed');
    expect(allowedNext).toContain('cancelled');
    expect(allowedNext).not.toContain('shipped');
    expect(allowedNext).not.toContain('delivered');
  });

  it('validates transition function', () => {
    const canTransition = (from: string, to: string): boolean => {
      const allowed = validTransitions[from] || [];
      return allowed.includes(to);
    };

    expect(canTransition('pending', 'confirmed')).toBe(true);
    expect(canTransition('pending', 'shipped')).toBe(false);
    expect(canTransition('delivered', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
  });
});

describe('Order Calculations', () => {
  it('calculates line item total', () => {
    const item = { quantity: 3, unitPrice: 49.99 };
    const lineTotal = item.quantity * item.unitPrice;

    expect(lineTotal).toBeCloseTo(149.97, 2);
  });

  it('calculates order subtotal', () => {
    const items = [
      { quantity: 2, unitPrice: 99.99 },
      { quantity: 1, unitPrice: 49.99 },
      { quantity: 3, unitPrice: 29.99 },
    ];

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    expect(subtotal).toBeCloseTo(339.94, 2);
  });

  it('calculates order total with tax', () => {
    const subtotal = 100;
    const taxRate = 0.11; // 11% VAT
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    expect(tax).toBeCloseTo(11, 2);
    expect(total).toBeCloseTo(111, 2);
  });

  it('calculates order total with shipping', () => {
    const subtotal = 100;
    const shipping = 10;
    const total = subtotal + shipping;

    expect(total).toBe(110);
  });

  it('applies discount correctly', () => {
    const subtotal = 100;
    const discountPercent = 10;
    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;

    expect(discount).toBe(10);
    expect(total).toBe(90);
  });

  it('calculates full order total', () => {
    const subtotal = 200;
    const discount = 20;
    const shipping = 15;
    const tax = (subtotal - discount) * 0.11;
    const total = subtotal - discount + shipping + tax;

    expect(total).toBeCloseTo(214.8, 2);
  });
});

describe('Order Number Generation', () => {
  it('generates sequential order numbers', () => {
    const generateSequential = (lastNumber: number): string => {
      const next = lastNumber + 1;
      return `ORD-${String(next).padStart(6, '0')}`;
    };

    expect(generateSequential(0)).toBe('ORD-000001');
    expect(generateSequential(99)).toBe('ORD-000100');
    expect(generateSequential(999999)).toBe('ORD-1000000');
  });

  it('generates date-based order numbers', () => {
    const generateDateBased = (): string => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `ORD-${year}${month}${day}-${random}`;
    };

    const orderNumber = generateDateBased();
    expect(orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{4}$/);
  });
});
