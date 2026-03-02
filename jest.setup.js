import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill for Web API globals needed by Next.js
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Add Response.json static method with proper body handling
if (typeof Response !== 'undefined' && typeof Response.json !== 'function') {
  Response.json = function(data, init = {}) {
    const jsonString = JSON.stringify(data);
    const headers = new Headers(init.headers || {});
    headers.set('content-type', 'application/json');

    // Create a custom response that stores the data for later retrieval
    const response = new Response(jsonString, {
      ...init,
      headers,
    });

    // Store the original data so json() can return it
    response._jsonData = data;

    // Override json() to return the stored data
    const originalJson = response.json.bind(response);
    response.json = async function() {
      if (this._jsonData !== undefined) {
        return this._jsonData;
      }
      return originalJson();
    };

    return response;
  };
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
