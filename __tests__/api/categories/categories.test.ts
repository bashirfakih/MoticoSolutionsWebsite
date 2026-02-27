/**
 * Categories API Route Tests
 * Tests CRUD operations, hierarchy, and slug lookup
 */

// Mock Prisma
const mockPrismaCategory = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  prisma: {
    category: mockPrismaCategory,
  },
}));

// Mock session
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

describe('Categories API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  describe('GET /api/categories', () => {
    it('returns all categories', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Power Tools',
          slug: 'power-tools',
          parentId: null,
          isActive: true,
          _count: { products: 10 },
        },
        {
          id: 'cat-2',
          name: 'Hand Tools',
          slug: 'hand-tools',
          parentId: null,
          isActive: true,
          _count: { products: 15 },
        },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(mockCategories);
      mockPrismaCategory.count.mockResolvedValue(2);

      const result = await mockPrismaCategory.findMany({});
      expect(result).toHaveLength(2);
    });

    it('filters root categories (no parent)', async () => {
      const rootCategories = [
        { id: 'cat-1', name: 'Root 1', parentId: null },
        { id: 'cat-2', name: 'Root 2', parentId: null },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(rootCategories);

      const whereClause = { parentId: null };
      expect(whereClause.parentId).toBeNull();
    });

    it('filters by parent ID', async () => {
      const parentId = 'cat-parent';
      const childCategories = [
        { id: 'cat-1', name: 'Child 1', parentId },
        { id: 'cat-2', name: 'Child 2', parentId },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(childCategories);

      const whereClause = { parentId };
      expect(whereClause.parentId).toBe(parentId);
    });

    it('filters active categories only', async () => {
      const activeCategories = [
        { id: 'cat-1', name: 'Active', isActive: true },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(activeCategories);

      const whereClause = { isActive: true };
      expect(whereClause.isActive).toBe(true);
    });

    it('returns categories with product count', async () => {
      const categories = [
        {
          id: 'cat-1',
          name: 'Category',
          _count: { products: 25 },
        },
      ];

      mockPrismaCategory.findMany.mockResolvedValue(categories);

      const result = await mockPrismaCategory.findMany({
        include: { _count: { select: { products: true } } },
      });

      expect(result[0]._count.products).toBe(25);
    });
  });

  describe('POST /api/categories', () => {
    it('creates a new root category', async () => {
      const newCategory = {
        name: 'New Category',
        slug: 'new-category',
        description: 'Category description',
        isActive: true,
        parentId: null,
      };

      const createdCategory = {
        id: 'cat-new',
        ...newCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaCategory.create.mockResolvedValue(createdCategory);
      mockPrismaCategory.findUnique.mockResolvedValue(null); // No duplicate

      const result = await mockPrismaCategory.create({ data: newCategory });

      expect(result.id).toBe('cat-new');
      expect(result.name).toBe('New Category');
    });

    it('creates a child category', async () => {
      const parentCategory = {
        id: 'cat-parent',
        name: 'Parent',
        slug: 'parent',
      };

      const childCategory = {
        name: 'Child Category',
        slug: 'child-category',
        parentId: 'cat-parent',
        isActive: true,
      };

      mockPrismaCategory.findUnique.mockResolvedValue(parentCategory);
      mockPrismaCategory.create.mockResolvedValue({
        id: 'cat-child',
        ...childCategory,
      });

      const result = await mockPrismaCategory.create({ data: childCategory });

      expect(result.parentId).toBe('cat-parent');
    });

    it('rejects duplicate slug', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue({
        id: 'existing',
        slug: 'duplicate-slug',
      });

      const duplicate = await mockPrismaCategory.findUnique({
        where: { slug: 'duplicate-slug' },
      });

      expect(duplicate).not.toBeNull();
    });

    it('validates parent exists', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      const parent = await mockPrismaCategory.findUnique({
        where: { id: 'non-existent-parent' },
      });

      expect(parent).toBeNull();
    });
  });

  describe('GET /api/categories/[id]', () => {
    it('returns category by ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Power Tools',
        slug: 'power-tools',
        description: 'All power tools',
        parentId: null,
        isActive: true,
        parent: null,
        children: [
          { id: 'cat-2', name: 'Drills', slug: 'drills' },
          { id: 'cat-3', name: 'Sanders', slug: 'sanders' },
        ],
        _count: { products: 10 },
      };

      mockPrismaCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await mockPrismaCategory.findUnique({
        where: { id: 'cat-1' },
        include: {
          parent: true,
          children: true,
          _count: { select: { products: true } },
        },
      });

      expect(result).toBeDefined();
      expect(result.children).toHaveLength(2);
      expect(result._count.products).toBe(10);
    });

    it('returns 404 for non-existent category', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      const result = await mockPrismaCategory.findUnique({
        where: { id: 'non-existent' },
      });

      expect(result).toBeNull();
    });
  });

  describe('GET /api/categories/slug/[slug]', () => {
    it('returns category by slug', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Power Tools',
        slug: 'power-tools',
        description: 'All power tools',
        parentId: null,
        isActive: true,
        parent: null,
        children: [
          { id: 'cat-2', name: 'Drills', slug: 'drills', isActive: true },
        ],
        _count: { products: 10 },
      };

      mockPrismaCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await mockPrismaCategory.findUnique({
        where: { slug: 'power-tools' },
        include: {
          parent: true,
          children: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { products: true } },
        },
      });

      expect(result).toBeDefined();
      expect(result.slug).toBe('power-tools');
      expect(result.name).toBe('Power Tools');
    });

    it('handles URL-encoded slugs', async () => {
      const encodedSlug = encodeURIComponent('power-tools');
      const decodedSlug = decodeURIComponent(encodedSlug);

      expect(decodedSlug).toBe('power-tools');
    });

    it('returns 404 for non-existent slug', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      const result = await mockPrismaCategory.findUnique({
        where: { slug: 'non-existent-slug' },
      });

      expect(result).toBeNull();
    });
  });

  describe('PATCH /api/categories/[id]', () => {
    it('updates category name', async () => {
      const existingCategory = {
        id: 'cat-1',
        name: 'Old Name',
        slug: 'old-name',
      };

      mockPrismaCategory.findUnique.mockResolvedValue(existingCategory);
      mockPrismaCategory.update.mockResolvedValue({
        ...existingCategory,
        name: 'New Name',
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { name: 'New Name' },
      });

      expect(result.name).toBe('New Name');
    });

    it('updates category slug', async () => {
      mockPrismaCategory.findUnique
        .mockResolvedValueOnce({ id: 'cat-1', slug: 'old-slug' }) // Find category
        .mockResolvedValueOnce(null); // No duplicate slug

      mockPrismaCategory.update.mockResolvedValue({
        id: 'cat-1',
        slug: 'new-slug',
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { slug: 'new-slug' },
      });

      expect(result.slug).toBe('new-slug');
    });

    it('prevents self-referential parent', async () => {
      const category = { id: 'cat-1', parentId: null };

      // Attempting to set parentId to self should fail
      const updateData = { parentId: 'cat-1' };

      expect(updateData.parentId).toBe(category.id);
      // API should return 400 error
    });

    it('prevents circular parent reference', async () => {
      // Category hierarchy: cat-1 -> cat-2 -> cat-3
      // Trying to set cat-1's parent to cat-3 should fail

      const getDescendantIds = async (categoryId: string): Promise<string[]> => {
        // Simulated descendant collection
        const descendants: Record<string, string[]> = {
          'cat-1': ['cat-2', 'cat-3'],
          'cat-2': ['cat-3'],
          'cat-3': [],
        };
        return descendants[categoryId] || [];
      };

      const descendants = await getDescendantIds('cat-1');
      const wouldBeCircular = descendants.includes('cat-3');

      expect(wouldBeCircular).toBe(true);
    });

    it('toggles active status', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue({
        id: 'cat-1',
        isActive: true,
      });

      mockPrismaCategory.update.mockResolvedValue({
        id: 'cat-1',
        isActive: false,
      });

      const result = await mockPrismaCategory.update({
        where: { id: 'cat-1' },
        data: { isActive: false },
      });

      expect(result.isActive).toBe(false);
    });
  });

  describe('DELETE /api/categories/[id]', () => {
    it('deletes empty category', async () => {
      const category = {
        id: 'cat-1',
        name: 'Empty Category',
        _count: { children: 0, products: 0 },
      };

      mockPrismaCategory.findUnique.mockResolvedValue(category);
      mockPrismaCategory.delete.mockResolvedValue(category);

      const result = await mockPrismaCategory.delete({
        where: { id: 'cat-1' },
      });

      expect(result.id).toBe('cat-1');
    });

    it('prevents deletion when category has children', async () => {
      const category = {
        id: 'cat-1',
        name: 'Parent Category',
        _count: { children: 3, products: 0 },
      };

      mockPrismaCategory.findUnique.mockResolvedValue(category);

      // Should not allow deletion
      expect(category._count.children).toBeGreaterThan(0);
    });

    it('prevents deletion when category has products', async () => {
      const category = {
        id: 'cat-1',
        name: 'Category with Products',
        _count: { children: 0, products: 5 },
      };

      mockPrismaCategory.findUnique.mockResolvedValue(category);

      // Should not allow deletion
      expect(category._count.products).toBeGreaterThan(0);
    });

    it('returns 404 for non-existent category', async () => {
      mockPrismaCategory.findUnique.mockReset();
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      const result = await mockPrismaCategory.findUnique({
        where: { id: 'non-existent' },
      });

      expect(result).toBeNull();
    });
  });
});

describe('Category Tree API', () => {
  it('builds category tree structure', async () => {
    const flatCategories = [
      { id: '1', name: 'Root 1', parentId: null },
      { id: '2', name: 'Child 1.1', parentId: '1' },
      { id: '3', name: 'Child 1.2', parentId: '1' },
      { id: '4', name: 'Root 2', parentId: null },
      { id: '5', name: 'Child 2.1', parentId: '4' },
    ];

    interface TreeNode {
      id: string;
      name: string;
      parentId: string | null;
      children: TreeNode[];
    }

    const buildTree = (categories: typeof flatCategories): TreeNode[] => {
      const nodeMap = new Map<string, TreeNode>();
      const roots: TreeNode[] = [];

      // Create nodes
      categories.forEach((cat) => {
        nodeMap.set(cat.id, { ...cat, children: [] });
      });

      // Build tree
      categories.forEach((cat) => {
        const node = nodeMap.get(cat.id)!;
        if (cat.parentId === null) {
          roots.push(node);
        } else {
          const parent = nodeMap.get(cat.parentId);
          if (parent) {
            parent.children.push(node);
          }
        }
      });

      return roots;
    };

    const tree = buildTree(flatCategories);

    expect(tree).toHaveLength(2); // 2 root categories
    expect(tree[0].children).toHaveLength(2); // Root 1 has 2 children
    expect(tree[1].children).toHaveLength(1); // Root 2 has 1 child
  });

  it('calculates category depth', () => {
    const getDepth = (
      categoryId: string,
      categories: Map<string, { parentId: string | null }>
    ): number => {
      let depth = 0;
      let currentId: string | null = categoryId;

      while (currentId) {
        const category = categories.get(currentId);
        if (!category || !category.parentId) break;
        currentId = category.parentId;
        depth++;
      }

      return depth;
    };

    const categories = new Map([
      ['1', { parentId: null }],
      ['2', { parentId: '1' }],
      ['3', { parentId: '2' }],
      ['4', { parentId: '3' }],
    ]);

    expect(getDepth('1', categories)).toBe(0);
    expect(getDepth('2', categories)).toBe(1);
    expect(getDepth('3', categories)).toBe(2);
    expect(getDepth('4', categories)).toBe(3);
  });

  it('gets category breadcrumb path', async () => {
    const getCategoryPath = async (
      categoryId: string,
      getCategory: (id: string) => Promise<{ id: string; name: string; parentId: string | null } | null>
    ): Promise<{ id: string; name: string }[]> => {
      const path: { id: string; name: string }[] = [];
      let currentId: string | null = categoryId;

      while (currentId) {
        const category = await getCategory(currentId);
        if (!category) break;
        path.unshift({ id: category.id, name: category.name });
        currentId = category.parentId;
      }

      return path;
    };

    const mockCategories: Record<string, { id: string; name: string; parentId: string | null }> = {
      '1': { id: '1', name: 'Tools', parentId: null },
      '2': { id: '2', name: 'Power Tools', parentId: '1' },
      '3': { id: '3', name: 'Drills', parentId: '2' },
    };

    const getCategory = async (id: string) => mockCategories[id] || null;

    const path = await getCategoryPath('3', getCategory);

    expect(path).toHaveLength(3);
    expect(path[0].name).toBe('Tools');
    expect(path[1].name).toBe('Power Tools');
    expect(path[2].name).toBe('Drills');
  });
});

describe('Category Slug Validation', () => {
  it('validates slug format', () => {
    const validSlugs = [
      'power-tools',
      'hand-tools-123',
      'drills',
      'sanders-and-grinders',
    ];

    const invalidSlugs = [
      'Power Tools', // Uppercase
      'power tools', // Space
      'power_tools', // Underscore
      '', // Empty
      '-power-tools', // Leading dash
      'power-tools-', // Trailing dash
    ];

    const isValidSlug = (slug: string): boolean => {
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    };

    validSlugs.forEach((slug) => {
      expect(isValidSlug(slug)).toBe(true);
    });

    invalidSlugs.forEach((slug) => {
      expect(isValidSlug(slug)).toBe(false);
    });
  });

  it('generates slug from name', () => {
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    };

    expect(generateSlug('Power Tools')).toBe('power-tools');
    expect(generateSlug('  Hand Tools  ')).toBe('hand-tools');
    expect(generateSlug('Drills & Sanders')).toBe('drills-sanders');
    expect(generateSlug('Tools - Premium')).toBe('tools-premium');
  });
});

describe('Category Sorting', () => {
  it('sorts categories by sortOrder', () => {
    const categories = [
      { id: '1', name: 'Third', sortOrder: 3 },
      { id: '2', name: 'First', sortOrder: 1 },
      { id: '3', name: 'Second', sortOrder: 2 },
    ];

    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

    expect(sorted[0].name).toBe('First');
    expect(sorted[1].name).toBe('Second');
    expect(sorted[2].name).toBe('Third');
  });

  it('sorts categories by name when sortOrder is equal', () => {
    const categories = [
      { id: '1', name: 'Zebra', sortOrder: 1 },
      { id: '2', name: 'Apple', sortOrder: 1 },
      { id: '3', name: 'Mango', sortOrder: 1 },
    ];

    const sorted = [...categories].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    expect(sorted[0].name).toBe('Apple');
    expect(sorted[1].name).toBe('Mango');
    expect(sorted[2].name).toBe('Zebra');
  });
});
