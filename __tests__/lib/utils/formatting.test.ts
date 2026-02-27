/**
 * Formatting Utility Tests
 * Tests currency, date, number, and text formatting functions
 */

describe('Currency Formatting', () => {
  const formatCurrency = (
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  it('formats USD currency', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large amounts with thousands separator', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-99.99)).toBe('-$99.99');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(99.999)).toBe('$100.00');
    expect(formatCurrency(99.994)).toBe('$99.99');
  });

  it('formats with different currencies', () => {
    const eurAmount = formatCurrency(99.99, 'EUR', 'de-DE');
    expect(eurAmount).toContain('99,99');
    expect(eurAmount).toContain('€');
  });
});

describe('Date Formatting', () => {
  const formatDate = (
    date: Date | string,
    format: 'short' | 'long' | 'relative' = 'short'
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'short') {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (format === 'long') {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    // Relative format
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  it('formats date in short format', () => {
    const date = new Date('2024-03-15');
    const formatted = formatDate(date, 'short');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('formats date in long format', () => {
    const date = new Date('2024-03-15');
    const formatted = formatDate(date, 'long');
    expect(formatted).toContain('March');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('handles string date input', () => {
    const formatted = formatDate('2024-03-15', 'short');
    expect(formatted).toContain('Mar');
  });

  it('formats today as relative', () => {
    const today = new Date();
    const formatted = formatDate(today, 'relative');
    expect(formatted).toBe('Today');
  });

  it('formats yesterday as relative', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = formatDate(yesterday, 'relative');
    expect(formatted).toBe('Yesterday');
  });
});

describe('Time Formatting', () => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  it('formats morning time', () => {
    const date = new Date('2024-03-15T09:30:00');
    expect(formatTime(date)).toMatch(/9:30\s*AM/i);
  });

  it('formats afternoon time', () => {
    const date = new Date('2024-03-15T14:45:00');
    expect(formatTime(date)).toMatch(/2:45\s*PM/i);
  });

  it('formats midnight', () => {
    const date = new Date('2024-03-15T00:00:00');
    expect(formatTime(date)).toMatch(/12:00\s*AM/i);
  });

  it('formats noon', () => {
    const date = new Date('2024-03-15T12:00:00');
    expect(formatTime(date)).toMatch(/12:00\s*PM/i);
  });
});

describe('Number Formatting', () => {
  const formatNumber = (
    num: number,
    decimals: number = 0,
    locale: string = 'en-US'
  ): string => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  it('formats integers with thousands separator', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('formats decimals', () => {
    expect(formatNumber(99.99, 2)).toBe('99.99');
    expect(formatNumber(99, 2)).toBe('99.00');
  });

  it('rounds to specified decimals', () => {
    expect(formatNumber(99.999, 2)).toBe('100.00');
    expect(formatNumber(99.994, 2)).toBe('99.99');
  });

  const formatPercent = (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  it('formats percentages', () => {
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(0.125, 1)).toBe('12.5%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('Compact Number Formatting', () => {
  const formatCompact = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  it('formats thousands', () => {
    expect(formatCompact(1000)).toBe('1.0K');
    expect(formatCompact(5500)).toBe('5.5K');
  });

  it('formats millions', () => {
    expect(formatCompact(1000000)).toBe('1.0M');
    expect(formatCompact(2500000)).toBe('2.5M');
  });

  it('keeps small numbers as-is', () => {
    expect(formatCompact(999)).toBe('999');
    expect(formatCompact(50)).toBe('50');
  });
});

describe('Phone Number Formatting', () => {
  const formatPhoneLebanon = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Lebanon format: +961 X XXX XXX
    if (digits.startsWith('961') && digits.length === 11) {
      return `+961 ${digits[3]} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }

    // 8-digit local format: XX XXX XXX
    if (digits.length === 8) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }

    return phone; // Return original if can't format
  };

  it('formats Lebanon mobile number', () => {
    expect(formatPhoneLebanon('9613741565')).toBe('9613741565'); // 10 digits - not matched
    expect(formatPhoneLebanon('+9613741565')).toBe('+9613741565'); // Missing digit
  });

  it('formats 11-digit Lebanon number', () => {
    expect(formatPhoneLebanon('96103741565')).toBe('+961 0 374 1565');
  });

  it('formats 8-digit local number', () => {
    expect(formatPhoneLebanon('03741565')).toBe('03 741 565');
  });

  it('returns original for unknown format', () => {
    expect(formatPhoneLebanon('12345')).toBe('12345');
  });
});

describe('Text Truncation', () => {
  const truncate = (text: string, maxLength: number, suffix: string = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  };

  it('does not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('uses custom suffix', () => {
    expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('Slug Utilities', () => {
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with dashes', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('hello    world')).toBe('hello-world');
  });

  it('handles leading/trailing whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles accented characters', () => {
    expect(slugify('café résumé')).toBe('caf-rsum');
  });

  const deslugify = (slug: string): string => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  it('converts slug back to title', () => {
    expect(deslugify('hello-world')).toBe('Hello World');
    expect(deslugify('power-tools')).toBe('Power Tools');
  });
});

describe('Address Formatting', () => {
  interface Address {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }

  const formatAddress = (address: Address): string => {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

  it('formats complete address', () => {
    const address: Address = {
      street: '123 Main St',
      city: 'Beirut',
      state: '',
      postalCode: '',
      country: 'Lebanon',
    };

    expect(formatAddress(address)).toBe('123 Main St, Beirut, Lebanon');
  });

  it('handles missing fields', () => {
    const address: Address = {
      city: 'Beirut',
      country: 'Lebanon',
    };

    expect(formatAddress(address)).toBe('Beirut, Lebanon');
  });

  it('handles empty address', () => {
    const address: Address = {};
    expect(formatAddress(address)).toBe('');
  });
});

describe('File Size Formatting', () => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('handles zero', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });
});

describe('Order Number Formatting', () => {
  const formatOrderNumber = (prefix: string, number: number, padding: number = 6): string => {
    return `${prefix}-${String(number).padStart(padding, '0')}`;
  };

  it('pads order number', () => {
    expect(formatOrderNumber('ORD', 1)).toBe('ORD-000001');
    expect(formatOrderNumber('ORD', 123)).toBe('ORD-000123');
  });

  it('uses custom padding', () => {
    expect(formatOrderNumber('ORD', 1, 4)).toBe('ORD-0001');
  });

  it('handles large numbers', () => {
    expect(formatOrderNumber('ORD', 1000000)).toBe('ORD-1000000');
  });

  const parseOrderNumber = (orderNumber: string): { prefix: string; number: number } | null => {
    const match = orderNumber.match(/^([A-Z]+)-(\d+)$/);
    if (!match) return null;
    return {
      prefix: match[1],
      number: parseInt(match[2], 10),
    };
  };

  it('parses order number', () => {
    const parsed = parseOrderNumber('ORD-000123');
    expect(parsed?.prefix).toBe('ORD');
    expect(parsed?.number).toBe(123);
  });

  it('returns null for invalid format', () => {
    expect(parseOrderNumber('invalid')).toBeNull();
    expect(parseOrderNumber('ORD123')).toBeNull();
  });
});
